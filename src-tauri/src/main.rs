// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod drawing_engine;
mod mouse_control;
mod image_processing;

use drawing_engine::{DrawingMethod, DrawingConfig, DrawingPoint, CanvasBounds, DrawingEngine, MatrixDotEngine, FloydSteinbergEngine, SpiralRasterEngine, ScanlineEngine, StipplingEngine, ContourVectorEngine};
use mouse_control::automation::MouseAutomation;
use mouse_control::path_optimizer::optimize_path;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
struct StartDrawingRequest {
    image_data: Vec<u8>,
    method: String,
    speed: u8,
    canvas_bounds: CanvasBoundsRequest,
    color_palette: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CanvasBoundsRequest {
    x: i32,
    y: i32,
    width: u32,
    height: u32,
}

use std::sync::Arc;

static AUTOMATION: Mutex<Option<Arc<Mutex<MouseAutomation>>>> = Mutex::new(None);

#[tauri::command]
fn start_drawing(request: StartDrawingRequest) -> Result<String, String> {
    let method = match request.method.as_str() {
        "matrix-dot" => DrawingMethod::MatrixDot,
        "floyd-steinberg" => DrawingMethod::FloydSteinberg,
        "continuous-line" => DrawingMethod::ContinuousLine,
        "spiral-raster" => DrawingMethod::SpiralRaster,
        "scanline" => DrawingMethod::Scanline,
        "stippling" => DrawingMethod::Stippling,
        "contour-vector" => DrawingMethod::ContourVector,
        _ => return Err("Unknown drawing method".to_string()),
    };

    let config = DrawingConfig {
        method,
        speed: request.speed,
        canvas_bounds: CanvasBounds {
            x: request.canvas_bounds.x,
            y: request.canvas_bounds.y,
            width: request.canvas_bounds.width,
            height: request.canvas_bounds.height,
        },
        color_palette: request.color_palette,
    };

    // Process image based on method
    let engine: Box<dyn DrawingEngine> = match config.method {
        DrawingMethod::MatrixDot => Box::new(MatrixDotEngine),
        DrawingMethod::FloydSteinberg => Box::new(FloydSteinbergEngine),
        DrawingMethod::SpiralRaster => Box::new(SpiralRasterEngine),
        DrawingMethod::Scanline => Box::new(ScanlineEngine),
        DrawingMethod::Stippling => Box::new(StipplingEngine),
        DrawingMethod::ContourVector => Box::new(ContourVectorEngine),
        DrawingMethod::ContinuousLine => {
            use drawing_engine::continuous_line::ContinuousLineEngine;
            Box::new(ContinuousLineEngine)
        },
    };

    let points = engine.process_image(request.image_data, &config);
    let optimized_points = optimize_path(points);

    // Create and store automation instance
    let automation = Arc::new(Mutex::new(MouseAutomation::new()));
    {
        let mut auto_guard = AUTOMATION.lock().unwrap();
        *auto_guard = Some(automation.clone());
    }

    // Start mouse automation (in a separate thread)
    let automation_clone = automation.clone();
    let speed = config.speed;
    std::thread::spawn(move || {
        let mut auto = automation_clone.lock().unwrap();
        let _ = auto.start_drawing(optimized_points, speed, |current, total| {
            // Progress callback - could emit event to frontend
            println!("Progress: {}/{}", current, total);
        });
    });

    Ok("Drawing started".to_string())
}

#[tauri::command]
fn stop_drawing() -> Result<String, String> {
    if let Ok(automation) = AUTOMATION.lock() {
        if let Some(ref auto) = *automation {
            let auto = auto.lock().unwrap();
            auto.stop();
        }
    }
    Ok("Drawing stopped".to_string())
}

#[tauri::command]
fn pause_drawing() -> Result<String, String> {
    if let Ok(automation) = AUTOMATION.lock() {
        if let Some(ref auto) = *automation {
            let auto = auto.lock().unwrap();
            auto.pause();
        }
    }
    Ok("Drawing paused".to_string())
}

#[tauri::command]
fn resume_drawing() -> Result<String, String> {
    if let Ok(automation) = AUTOMATION.lock() {
        if let Some(ref auto) = *automation {
            let auto = auto.lock().unwrap();
            auto.resume();
        }
    }
    Ok("Drawing resumed".to_string())
}

#[tauri::command]
fn capture_screenshot() -> Result<Vec<u8>, String> {
    use screenshots::Screen;
    use image::{ImageEncoder, codecs::png::PngEncoder, ColorType};
    
    let screens = Screen::all().map_err(|e| format!("Failed to get screens: {}", e))?;
    if screens.is_empty() {
        return Err("No screens found".to_string());
    }
    
    let screen = &screens[0];
    let captured = screen.capture().map_err(|e| format!("Failed to capture: {}", e))?;
    
    let width = captured.width();
    let height = captured.height();
    let raw = captured.rgba();
    
    let mut buffer = Vec::new();
    let encoder = PngEncoder::new(&mut buffer);
    encoder.write_image(&raw, width, height, ColorType::Rgba8)
        .map_err(|e| format!("Failed to encode PNG: {}", e))?;
    
    Ok(buffer)
}

#[tauri::command]
fn detect_color_palette(image_data: Vec<u8>) -> Result<Vec<String>, String> {
    use image::GenericImageView;
    use std::collections::HashMap;
    
    let img = image::load_from_memory(&image_data)
        .map_err(|e| format!("Failed to load image: {}", e))?;
    
    let (width, height) = img.dimensions();
    let mut color_counts: HashMap<String, u32> = HashMap::new();
    
    for y in (0..height).step_by(10) {
        for x in (0..width).step_by(10) {
            let pixel = img.get_pixel(x, y);
            let r = pixel[0];
            let g = pixel[1];
            let b = pixel[2];
            
            let qr = (r / 32) * 32;
            let qg = (g / 32) * 32;
            let qb = (b / 32) * 32;
            
            let color = format!("#{:02x}{:02x}{:02x}", qr, qg, qb);
            *color_counts.entry(color).or_insert(0) += 1;
        }
    }
    
    let mut colors: Vec<(String, u32)> = color_counts.into_iter().collect();
    colors.sort_by(|a, b| b.1.cmp(&a.1));
    colors.truncate(10);
    
    Ok(colors.into_iter().map(|(color, _)| color).collect())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            start_drawing,
            stop_drawing,
            pause_drawing,
            resume_drawing,
            capture_screenshot,
            detect_color_palette
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
