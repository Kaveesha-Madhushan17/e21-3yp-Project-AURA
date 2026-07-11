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
    }
}
