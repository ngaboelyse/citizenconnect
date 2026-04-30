# Generates CitizenConnect.ico in the same folder as this script
Add-Type -AssemblyName System.Drawing

$size = 256
$bmp  = New-Object System.Drawing.Bitmap($size, $size)
$g    = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode    = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# ── Background: rounded navy square ──────────────────────────────────────────
$bg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(2, 52, 105))
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$r = 40   # corner radius
$w = $size; $h = $size
$path.AddArc(0,       0,       $r*2, $r*2, 180, 90)
$path.AddArc($w-$r*2, 0,       $r*2, $r*2, 270, 90)
$path.AddArc($w-$r*2, $h-$r*2, $r*2, $r*2,   0, 90)
$path.AddArc(0,       $h-$r*2, $r*2, $r*2,  90, 90)
$path.CloseFigure()
$g.FillPath($bg, $path)

# ── Bullhorn shape ────────────────────────────────────────────────────────────
$white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)

# Mouthpiece (left rectangle)
$g.FillRectangle($white, 30, 95, 52, 66)

# Horn flare (trapezoid, widens to the right)
$horn = [System.Drawing.PointF[]]@(
    [System.Drawing.PointF]::new(82,  95),
    [System.Drawing.PointF]::new(82, 161),
    [System.Drawing.PointF]::new(178, 196),
    [System.Drawing.PointF]::new(178,  60)
)
$g.FillPolygon($white, $horn)

# Handle below mouthpiece
$handleBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(230,255,255,255))
$g.FillRectangle($handleBrush, 38, 161, 36, 50)

# ── Sound waves ───────────────────────────────────────────────────────────────
$wave1 = [System.Drawing.Pen]::new([System.Drawing.Color]::White, 14)
$wave1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$wave1.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawArc($wave1, 182, 103, 28, 50, -60, 120)

$wave2 = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(180,255,255,255), 12)
$wave2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$wave2.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawArc($wave2, 198, 82, 34, 92, -65, 130)

$wave3 = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(110,255,255,255), 10)
$wave3.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$wave3.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
$g.DrawArc($wave3, 216, 62, 36, 132, -68, 136)

$g.Dispose()

# ── Save as .ico (PNG inside ICO container) ───────────────────────────────────
$pngStream = New-Object System.IO.MemoryStream
$bmp.Save($pngStream, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $pngStream.ToArray()
$pngStream.Dispose()

$icoPath = Join-Path $PSScriptRoot "CitizenConnect.ico"
$fs      = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$bw      = New-Object System.IO.BinaryWriter($fs)

# ICO header
$bw.Write([int16]0)   # reserved
$bw.Write([int16]1)   # type: ICO
$bw.Write([int16]1)   # image count

# Image directory entry (0 = 256 for width/height)
$bw.Write([byte]0)    # width  (0 = 256)
$bw.Write([byte]0)    # height (0 = 256)
$bw.Write([byte]0)    # palette colors
$bw.Write([byte]0)    # reserved
$bw.Write([int16]1)   # planes
$bw.Write([int16]32)  # bits per pixel
$bw.Write([int32]$pngBytes.Length)
$bw.Write([int32]22)  # data offset: 6 (header) + 16 (dir entry)

# PNG image data
$bw.Write($pngBytes)
$bw.Close()
$fs.Close()
$bmp.Dispose()

Write-Host "Icon created: $icoPath"
