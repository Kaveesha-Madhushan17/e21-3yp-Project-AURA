package com.aura;

import com.aura.system.entities.RestaurantTable;
import com.aura.system.repositories.RestaurantTableRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;
import java.util.TimeZone;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@SpringBootApplication
public class AuraApplication {

	private static final Logger log = LoggerFactory.getLogger(AuraApplication.class);

	public static void main(String[] args) {
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Colombo"));
		SpringApplication.run(AuraApplication.class, args);
	}

	@Bean
	public ApplicationRunner seedRestaurantTables(RestaurantTableRepository tableRepository) {
		return args -> {
			try {
				long count = tableRepository.count();
				if (count == 0) {
					log.info("No restaurant tables found, seeding default tables 1-10");
					List<RestaurantTable> tables = IntStream.rangeClosed(1, 10)
						.mapToObj(i -> RestaurantTable.builder()
							.tableNumber(String.valueOf(i))
							.capacity(4)
							.status("available")
							.build())
						.collect(Collectors.toList());
					tableRepository.saveAll(tables);
					log.info("Seeded {} restaurant tables", tables.size());
				} else {
					log.info("Restaurant tables already exist ({} rows), skipping seeding", count);
				}
			} catch (Exception ex) {
				log.error("Failed to seed restaurant tables on startup: {}", ex.getMessage(), ex);
			}
		};
	}

}