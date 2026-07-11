package com.aura.system.seeders;

import com.aura.system.entities.RestaurantTable;
import com.aura.system.repositories.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TableSeeder implements CommandLineRunner {

    private final RestaurantTableRepository tableRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Ensuring default tables 1-10 exist in the database...");
        for (int i = 1; i <= 10; i++) {
            String tableNum = String.valueOf(i);
            if (tableRepository.findByTableNumber(tableNum) == null) {
                log.info("Table {} not found. Creating it...", tableNum);
                tableRepository.save(RestaurantTable.builder()
                        .tableNumber(tableNum)
                        .capacity(20) // Provide a sufficiently large capacity for any party size test
                        .status("AVAILABLE")
                        .build());
            }
        }
        log.info("Finished ensuring default tables 1-10 exist.");
    }
}
