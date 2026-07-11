package com.aura.system.dtos.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SlotAvailabilityResponse {
    private String date;
    private List<SlotInfo> slots;

    @Data
    @Builder
    public static class SlotInfo {
        private String time;
        private boolean available;
        private Integer availableTables;
        // When a specific tableNumber is requested, this field indicates whether that
        // table is free for the slot (true), booked (false), or null when not applicable.
        private Boolean tableAvailable;
    }
}
