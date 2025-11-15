use enigo::*;
use crate::drawing_engine::DrawingPoint;
use std::time::Duration;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

pub struct MouseAutomation {
    enigo: Enigo,
    is_running: Arc<AtomicBool>,
    is_paused: Arc<AtomicBool>,
}

impl MouseAutomation {
    pub fn new() -> Self {
        Self {
            enigo: Enigo::new(),
            is_running: Arc::new(AtomicBool::new(false)),
            is_paused: Arc::new(AtomicBool::new(false)),
        }
    }

    pub fn start_drawing(
        &mut self,
        points: Vec<DrawingPoint>,
        speed: u8,
        progress_callback: impl Fn(u32, u32),
    ) -> Result<(), String> {
        self.is_running.store(true, Ordering::Relaxed);
        self.is_paused.store(false, Ordering::Relaxed);

        let total_points = points.len() as u32;
        let speed_multiplier = speed as f64;
        
        // Calculate delay based on speed (higher speed = lower delay)
        let base_delay_ms = 10.0;
        let delay_ms = (base_delay_ms / speed_multiplier).max(1.0);
        let delay = Duration::from_millis(delay_ms as u64);

        for (index, point) in points.iter().enumerate() {
            // Check if stopped
            if !self.is_running.load(Ordering::Relaxed) {
                break;
            }

            // Wait if paused
            while self.is_paused.load(Ordering::Relaxed) && self.is_running.load(Ordering::Relaxed) {
                std::thread::sleep(Duration::from_millis(100));
            }

            // Move mouse to position
            self.enigo.mouse_move_to(point.x, point.y);
            std::thread::sleep(delay);

            // Click if needed (for dot placement)
            if point.size > 0 {
                self.enigo.mouse_click(MouseButton::Left);
                std::thread::sleep(delay / 2);
            }

            // Report progress
            if index % 10 == 0 {
                progress_callback(index as u32, total_points);
            }
        }

        self.is_running.store(false, Ordering::Relaxed);
        Ok(())
    }

    pub fn stop(&self) {
        self.is_running.store(false, Ordering::Relaxed);
    }

    pub fn pause(&self) {
        self.is_paused.store(true, Ordering::Relaxed);
    }

    pub fn resume(&self) {
        self.is_paused.store(false, Ordering::Relaxed);
    }

    pub fn is_running(&self) -> bool {
        self.is_running.load(Ordering::Relaxed)
    }
}
