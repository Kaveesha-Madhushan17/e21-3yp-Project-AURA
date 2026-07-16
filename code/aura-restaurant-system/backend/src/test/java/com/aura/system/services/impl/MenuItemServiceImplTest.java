package com.aura.system.services.impl;

import com.aura.service.ImageService;
import com.aura.system.entities.MenuItem;
import com.aura.system.mqtt.MqttGateway;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Assigned to: E/21/024 Amaranga
 * Module: Menu Management
 * Function under test: MenuItemServiceImpl.createMenuItem(MenuItem, MultipartFile)
 */
@ExtendWith(MockitoExtension.class)
class MenuItemServiceImplTest {

    @Mock private com.aura.system.repositories.MenuItemRepository menuItemRepository;
    @Mock private ImageService imageService;
    @Mock private MqttGateway mqttGateway;

    private MenuItemServiceImpl menuItemService;

    @BeforeEach
    void setUp() {
        menuItemService = new MenuItemServiceImpl(
                menuItemRepository, imageService, mqttGateway, new ObjectMapper());
        // Repository.save just returns whatever it was given, with an id assigned once.
        when(menuItemRepository.save(any(MenuItem.class))).thenAnswer(inv -> {
            MenuItem m = inv.getArgument(0);
            if (m.getMenuItemId() == null) m.setMenuItemId(1);
            return m;
        });
    }

    private MenuItem validItem() {
        return MenuItem.builder()
                .name("Chicken Kottu")
                .description("Spicy kottu")
                .price(850.0f)
                .category("Main")
                .availability(true)
                .build();
    }

    // ── EP1: valid item + valid image ───────────────────────────────────────
    @Test
    @DisplayName("EP1: valid item + valid image -> uploads image, saves item, publishes MQTT")
    void createMenuItem_withValidItemAndImage_uploadsAndSaves() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(imageService.uploadImage(file)).thenReturn("https://cloud/img.png");

        MenuItem result = menuItemService.createMenuItem(validItem(), file);

        assertThat(result.getImageUrl()).isEqualTo("https://cloud/img.png");
        verify(imageService, times(1)).uploadImage(file);
        verify(mqttGateway, times(1)).sendToMqtt(anyString(), eq("aura/menu/updated"));
    }

    // ── EP2 / Boundary: file == null -> upload skipped ──────────────────────
    @Test
    @DisplayName("EP2 (boundary): file is null -> upload skipped, item still saved")
    void createMenuItem_withNullFile_skipsUpload() {
        MenuItem result = menuItemService.createMenuItem(validItem(), null);

        assertThat(result.getImageUrl()).isNull();
        verify(imageService, never()).uploadImage(any());
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    // ── EP3 / Boundary: file present but empty (0 bytes) -> upload skipped ──
    @Test
    @DisplayName("EP3 (boundary): empty file (0 bytes) -> upload skipped, item still saved")
    void createMenuItem_withEmptyFile_skipsUpload() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(true);

        MenuItem result = menuItemService.createMenuItem(validItem(), file);

        assertThat(result.getImageUrl()).isNull();
        verify(imageService, never()).uploadImage(any());
    }

    // ── EP4: image upload throws -> swallowed, item saved anyway ────────────
    @Test
    @DisplayName("EP4: image upload throws -> exception is swallowed, item saved without image")
    void createMenuItem_whenImageUploadThrows_stillSavesItem() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(imageService.uploadImage(file)).thenThrow(new RuntimeException("Cloudinary down"));

        MenuItem item = validItem();
        MenuItem result = assertDoesNotThrowAndReturn(() -> menuItemService.createMenuItem(item, file));

        assertThat(result).isNotNull();
        assertThat(result.getImageUrl()).isNull();
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    // ── Boundary (gap): negative price is accepted, no validation exists ────
    @Test
    @DisplayName("Boundary/gap: negative price is saved without rejection (no validation in service)")
    void createMenuItem_withNegativePrice_isSavedWithoutValidation() {
        MenuItem item = validItem();
        item.setPrice(-5.0f);

        MenuItem result = menuItemService.createMenuItem(item, null);

        assertThat(result.getPrice()).isEqualTo(-5.0f);
    }

    // ── Error case (real bug): MQTT publish throws a non-JSON exception ─────
    @Test
    @DisplayName("Error case: MQTT publish throws -> exception propagates even though item was already saved")
    void createMenuItem_whenMqttPublishThrows_exceptionPropagates() {
        doThrow(new RuntimeException("Broker unreachable"))
                .when(mqttGateway).sendToMqtt(anyString(), anyString());

        MenuItem item = validItem();
        assertThatThrownBy(() -> menuItemService.createMenuItem(item, null))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Broker unreachable");

        // The item WAS already persisted before the MQTT call blew up -- a data
        // consistency gap: client sees a 500 but the item exists in the DB.
        verify(menuItemRepository, times(1)).save(any(MenuItem.class));
    }

    private MenuItem assertDoesNotThrowAndReturn(java.util.concurrent.Callable<MenuItem> callable) {
        try {
            return callable.call();
        } catch (Exception e) {
            throw new AssertionError("Expected no exception but got: " + e, e);
        }
    }
}
