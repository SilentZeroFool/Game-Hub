use std::process::Command;
use std::path::Path;

#[tauri::command]
fn run_game(path: String) -> Result<(), String> {
  let p = Path::new(&path);
  if !p.exists() {
    return Err(format!("Exe not found: {}", path));
  }
  // Use the exe's folder as working directory so relative resources work
  let dir = p.parent().unwrap_or_else(|| Path::new("."));
  Command::new(&path)
    .current_dir(dir)
    .spawn()
    .map_err(|e| format!("Failed to spawn '{}': {}", path, e))?;
  Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![run_game])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
