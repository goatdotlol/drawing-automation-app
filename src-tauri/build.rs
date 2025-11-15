use std::{env, fs, io::Write, path::Path};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let manifest_dir = env::var("CARGO_MANIFEST_DIR")?;
    let icons_dir = Path::new(&manifest_dir).join("icons");
    let ico_path = icons_dir.join("icon.ico");

    fs::create_dir_all(&icons_dir)?;

    // 1x1 transparent PNG (base64) - valid PNG data
    let png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAAiISF8AAAAASUVORK5CYII=";
    let png = base64::decode(png_b64)?;

    // Build ICO structure with single PNG entry (modern ICO can contain PNG)
    let mut ico: Vec<u8> = vec![0, 0, 1, 0, 1, 0];
    let width: u8 = 1;
    let height: u8 = 1;
    let color_count: u8 = 0;
    let reserved: u8 = 0;
    let planes: u16 = 0;
    let bit_count: u16 = 32;
    let bytes_in_res: u32 = png.len() as u32;
    let image_offset: u32 = 6 + 16;

    ico.push(width);
    ico.push(height);
    ico.push(color_count);
    ico.push(reserved);
    ico.extend_from_slice(&planes.to_le_bytes());
    ico.extend_from_slice(&bit_count.to_le_bytes());
    ico.extend_from_slice(&bytes_in_res.to_le_bytes());
    ico.extend_from_slice(&image_offset.to_le_bytes());
    ico.extend_from_slice(&png);

    let mut f = fs::File::create(&ico_path)?;
    f.write_all(&ico)?;

    tauri_build::build();
    Ok(())
}

