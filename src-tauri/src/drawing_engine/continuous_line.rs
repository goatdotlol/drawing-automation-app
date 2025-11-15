use image::GenericImageView;
use super::{DrawingConfig, DrawingPoint, DrawingEngine};

pub struct ContinuousLineEngine;

impl DrawingEngine for ContinuousLineEngine {
    fn process_image(&self, image_data: Vec<u8>, config: &DrawingConfig) -> Vec<DrawingPoint> {
        // Simplified continuous line using edge detection
        let img = image::load_from_memory(&image_data)
            .expect("Failed to load image");
        
        let gray_img = img.grayscale();
        let (width, height) = gray_img.dimensions();
        let mut points = Vec::new();

        // Edge detection
        let threshold = 100u8;
        let mut edges = Vec::new();

        for y in 1..(height - 1) {
            for x in 1..(width - 1) {
                let gx = gray_img.get_pixel(x + 1, y)[0] as i16 - gray_img.get_pixel(x - 1, y)[0] as i16;
                let gy = gray_img.get_pixel(x, y + 1)[0] as i16 - gray_img.get_pixel(x, y - 1)[0] as i16;
                let magnitude = ((gx * gx + gy * gy) as f32).sqrt() as u8;

                if magnitude > threshold {
                    edges.push((x, y));
                }
            }
        }

        // Connect edges into continuous path (nearest neighbor)
        if !edges.is_empty() {
            let mut remaining = edges;
            let mut current = remaining.remove(0);
            
            while !remaining.is_empty() {
                let mut best_idx = 0;
                let mut best_dist = f64::MAX;
                
                for (idx, &(x, y)) in remaining.iter().enumerate() {
                    let dx = (x as i32 - current.0 as i32) as f64;
                    let dy = (y as i32 - current.1 as i32) as f64;
                    let dist = (dx * dx + dy * dy).sqrt();
                    
                    if dist < best_dist {
                        best_dist = dist;
                        best_idx = idx;
                    }
                }
                
                let next = remaining.remove(best_idx);
                
                // Add points along the line
                let steps = (best_dist as u32).max(1);
                for i in 0..=steps {
                    let t = i as f32 / steps as f32;
                    let x = (current.0 as f32 + (next.0 as f32 - current.0 as f32) * t) as u32;
                    let y = (current.1 as f32 + (next.1 as f32 - current.1 as f32) * t) as u32;
                    
                    let canvas_x = config.canvas_bounds.x + (x as i32 * config.canvas_bounds.width as i32 / width as i32);
                    let canvas_y = config.canvas_bounds.y + (y as i32 * config.canvas_bounds.height as i32 / height as i32);
                    
                    points.push(DrawingPoint {
                        x: canvas_x,
                        y: canvas_y,
                        color: "#000000".to_string(),
                        size: 255,
                    });
                }
                
                current = next;
            }
        }

        points
    }
}
