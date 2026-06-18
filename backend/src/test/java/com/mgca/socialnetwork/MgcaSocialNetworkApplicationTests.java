package com.mgca.socialnetwork;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test to verify the Spring application context loads successfully.
 * <p>
 * This test ensures that all beans are properly configured, all dependencies
 * are satisfied, and the application can start without errors.
 * </p>
 */
@SpringBootTest
@ActiveProfiles("test")
class MgcaSocialNetworkApplicationTests {

    @Test
    void contextLoads() {
        // If this test passes, the Spring application context was loaded successfully.
        // All beans, configurations, and auto-configurations are properly wired.
    }
}
