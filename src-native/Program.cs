using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Text.Json;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace GameHub
{
    internal static class Program
    {
        [STAThread]
        private static void Main()
        {
            Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainWindow());
        }
    }

    public class MainWindow : Form
    {
        private readonly WebView2 _webView;
        private string _webRootDirectory = "";

        public MainWindow()
        {
            Text = "Game Hub";
            LoadAppIcon();
            ClientSize = new Size(1300, 820);
            MinimumSize = new Size(960, 600);
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(10, 14, 23); // Matches Game Hub dark background

            _webView = new WebView2
            {
                Dock = DockStyle.Fill,
                BackColor = Color.FromArgb(10, 14, 23)
            };
            Controls.Add(_webView);

            InitializeApplicationAsync();
        }

        private async void InitializeApplicationAsync()
        {
            try
            {
                _webRootDirectory = EnsureWebAssetsExtracted();

                string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string userDataFolder = Path.Combine(localAppData, "GameHub", "WebView2UserData");
                Directory.CreateDirectory(userDataFolder);

                var env = await CoreWebView2Environment.CreateAsync(userDataFolder: userDataFolder);
                await _webView.EnsureCoreWebView2Async(env);

                // Configure WebView settings for clean desktop app feel
                _webView.CoreWebView2.Settings.IsStatusBarEnabled = false;
                _webView.CoreWebView2.Settings.IsZoomControlEnabled = false;
                _webView.CoreWebView2.Settings.AreDevToolsEnabled = true;

                // Host the local frontend securely under https://gamehub.local (enables all modern Web APIs without CORS/file restrictions)
                _webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "gamehub.local",
                    _webRootDirectory,
                    CoreWebView2HostResourceAccessKind.Allow
                );

                // Flag the environment so the React app detects the Pure Native host
                await _webView.CoreWebView2.AddScriptToExecuteOnDocumentCreatedAsync("window.__GAME_HUB_NATIVE__ = true;");

                // Listen for native API messages from JavaScript
                _webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;

                // Navigate to entry point
                _webView.Source = new Uri("https://gamehub.local/index.html");
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Failed to initialize Game Hub native webview: {ex.Message}\n\nEnsure Microsoft Edge WebView2 Runtime is installed on this machine.",
                    "Game Hub Initialization Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                string rawJson = e.WebMessageAsJson;
                using var doc = JsonDocument.Parse(rawJson);
                var root = doc.RootElement;

                string action = root.TryGetProperty("action", out var actionProp) ? actionProp.GetString() ?? "" : "";
                string id = root.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? "" : "";

                if (string.IsNullOrEmpty(action)) return;

                switch (action)
                {
                    case "browse_file":
                        HandleBrowseFile(id);
                        break;

                    case "run_game":
                        string path = root.TryGetProperty("path", out var pProp) ? pProp.GetString() ?? "" : "";
                        string method = root.TryGetProperty("method", out var mProp) ? mProp.GetString() ?? "cmd_start" : "cmd_start";
                        HandleRunGame(id, path, method);
                        break;

                    case "minimize":
                        BeginInvoke(new Action(() => { WindowState = FormWindowState.Minimized; }));
                        SendResponse(id, "ok", null);
                        break;

                    default:
                        SendResponse(id, null, $"Unknown native action: {action}");
                        break;
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error handling web message: {ex}");
            }
        }

        private void HandleBrowseFile(string id)
        {
            BeginInvoke(new Action(() =>
            {
                try
                {
                    using var ofd = new OpenFileDialog
                    {
                        Title = "Select Game Executable or Shortcut",
                        Filter = "Executables & Shortcuts (*.exe;*.bat;*.cmd;*.lnk;*.url)|*.exe;*.bat;*.cmd;*.lnk;*.url|All Files (*.*)|*.*",
                        CheckFileExists = true,
                        Multiselect = false
                    };

                    if (ofd.ShowDialog(this) == DialogResult.OK)
                    {
                        SendResponse(id, ofd.FileName, null);
                    }
                    else
                    {
                        SendResponse(id, null, null);
                    }
                }
                catch (Exception ex)
                {
                    SendResponse(id, null, ex.Message);
                }
            }));
        }

        private void HandleRunGame(string id, string path, string method)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                SendResponse(id, null, "Executable path cannot be empty.");
                return;
            }

            if (!File.Exists(path) && !Directory.Exists(path))
            {
                SendResponse(id, null, $"Executable not found at path: {path}");
                return;
            }

            try
            {
                string dir = Path.GetDirectoryName(path) ?? ".";
                if (string.IsNullOrWhiteSpace(dir)) dir = ".";

                if (method == "direct")
                {
                    // Spawns the executable directly (helps with certain Unity or engine games)
                    var psi = new ProcessStartInfo
                    {
                        FileName = path,
                        WorkingDirectory = dir,
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                }
                else if (method == "explorer")
                {
                    // Invokes Windows Explorer to launch the item as if double-clicked
                    var psi = new ProcessStartInfo
                    {
                        FileName = "explorer.exe",
                        Arguments = $"\"{path}\"",
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                }
                else if (method == "tauri_shell")
                {
                    // Shell-execute launcher
                    var psi = new ProcessStartInfo
                    {
                        FileName = path,
                        WorkingDirectory = dir,
                        UseShellExecute = true
                    };
                    Process.Start(psi);
                }
                else
                {
                    // Default 'cmd_start' method:
                    // Breaks out of host job object to bypass Windows 11 background Efficiency Mode throttling
                    var psi = new ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = $"/C start \"\" /D \"{dir}\" \"{path}\"",
                        CreateNoWindow = true,
                        UseShellExecute = false
                    };
                    Process.Start(psi);
                }

                SendResponse(id, "ok", null);
            }
            catch (Exception ex)
            {
                SendResponse(id, null, $"Failed to launch '{path}': {ex.Message}");
            }
        }

        private void SendResponse(string id, object? data, string? error)
        {
            if (string.IsNullOrEmpty(id) || _webView.CoreWebView2 == null) return;

            try
            {
                var payload = JsonSerializer.Serialize(new
                {
                    id,
                    data,
                    error
                });

                BeginInvoke(new Action(() =>
                {
                    _webView.CoreWebView2?.PostWebMessageAsJson(payload);
                }));
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Failed to send native response: {ex}");
            }
        }

        private static string EnsureWebAssetsExtracted()
        {
            // 1. Check if a local dist folder is present adjacent to executable (convenient for local dev)
            string adjacentDist = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist");
            if (Directory.Exists(adjacentDist) && File.Exists(Path.Combine(adjacentDist, "index.html")))
            {
                return adjacentDist;
            }

            // 2. Unpack embedded app.zip into LocalAppData
            string localAppData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string assetsDir = Path.Combine(localAppData, "GameHub", "www");
            Directory.CreateDirectory(assetsDir);

            var assembly = Assembly.GetExecutingAssembly();
            string? resourceName = assembly.GetManifestResourceNames()
                .FirstOrDefault(n => n.EndsWith("app.zip", StringComparison.OrdinalIgnoreCase));

            if (resourceName != null)
            {
                using var resourceStream = assembly.GetManifestResourceStream(resourceName);
                if (resourceStream != null)
                {
                    string versionFile = Path.Combine(assetsDir, ".version");
                    string currentVersion = $"{assembly.GetName().Version}_{resourceStream.Length}";

                    bool needsExtract = true;
                    if (File.Exists(versionFile) && File.Exists(Path.Combine(assetsDir, "index.html")))
                    {
                        string savedVersion = File.ReadAllText(versionFile).Trim();
                        if (savedVersion == currentVersion)
                        {
                            needsExtract = false;
                        }
                    }

                    if (needsExtract)
                    {
                        try
                        {
                            // Clear old assets if any
                            foreach (var file in Directory.GetFiles(assetsDir))
                            {
                                try { File.Delete(file); } catch { }
                            }
                            foreach (var dir in Directory.GetDirectories(assetsDir))
                            {
                                try { Directory.Delete(dir, true); } catch { }
                            }

                            using var archive = new ZipArchive(resourceStream, ZipArchiveMode.Read);
                            archive.ExtractToDirectory(assetsDir, overwriteFiles: true);
                            File.WriteAllText(versionFile, currentVersion);
                        }
                        catch (Exception ex)
                        {
                            Debug.WriteLine($"Warning: Failed to extract embedded assets cleanly: {ex.Message}");
                        }
                    }
                }
            }

            return assetsDir;
        }

        private void LoadAppIcon()
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                using var stream = assembly.GetManifestResourceStream("GameHub.icon.ico");
                if (stream != null)
                {
                    Icon = new Icon(stream);
                    return;
                }

                string localIconPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "icon.ico");
                if (File.Exists(localIconPath))
                {
                    Icon = new Icon(localIconPath);
                    return;
                }

                if (File.Exists("icon.ico"))
                {
                    Icon = new Icon("icon.ico");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Could not load application icon: {ex.Message}");
            }
        }
    }
}
