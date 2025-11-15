use std::{env, fs, io::Write, path::Path};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Ensure a Windows .ico exists for tauri-build. If not present, generate
    // a tiny 1x1 PNG-based ICO from an embedded base64 PNG. This avoids
    // failing CI when repository doesn't include an .ico binary.
    let manifest_dir = env::var("CARGO_MANIFEST_DIR")?;
    let icons_dir = Path::new(&manifest_dir).join("icons");
    let ico_path = icons_dir.join("icon.ico");

    if !ico_path.exists() {
        fs::create_dir_all(&icons_dir)?;

        // 1x1 transparent PNG (base64)
        let png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
        let png = base64::decode(png_b64)?;

        // Build ICO structure with single PNG image entry.
        // ICONDIR header: Reserved(2) Type(2=1) Count(2=1)
        let mut ico: Vec<u8> = vec![0, 0, 1, 0, 1, 0];

        // ICONDIRENTRY (16 bytes): width(1), height(1), color_count(1), reserved(1),
        // planes(2), bitcount(2), bytes_in_res(4), image_offset(4)
        let width: u8 = 1;
        let height: u8 = 1;
        let color_count: u8 = 0;
        let reserved: u8 = 0;
        let planes: u16 = 0;
        let bit_count: u16 = 32;
        let bytes_in_res: u32 = png.len() as u32;
        let image_offset: u32 = 6 + 16; // header + entry

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
    }

    tauri_build::build();
    Ok(())
}

