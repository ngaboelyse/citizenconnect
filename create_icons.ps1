# Generates PWA icons for Android (192x192 and 512x512)
Add-Type -AssemblyName System.Drawing

function Draw-Icon($size, $outPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Maskable safe zone: fill entire background (no rounded corners for maskable)
    $bg = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(2, 52, 105))
    $g.FillRectangle($bg, 0, 0, $size, $size)

    $s = $size / 256.0  # scale factor

    # Mouthpiece
    $white = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $g.FillRectangle($white, [int](30*$s), [int](95*$s), [int](52*$s), [int](66*$s))

    # Horn flare
    $horn = [System.Drawing.PointF[]]@(
        [System.Drawing.PointF]::new(82*$s,  95*$s),
        [System.Drawing.PointF]::new(82*$s, 161*$s),
        [System.Drawing.PointF]::new(178*$s,196*$s),
        [System.Drawing.PointF]::new(178*$s, 60*$s)
    )
    $g.FillPolygon($white, $horn)

    # Handle
    $faded = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(220,255,255,255))
    $g.FillRectangle($faded, [int](38*$s), [int](161*$s), [int](36*$s), [int](50*$s))

    # Sound waves
    $w1 = [System.Drawing.Pen]::new([System.Drawing.Color]::White, [float](14*$s))
    $w1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $w1.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($w1, [float](182*$s), [float](103*$s), [float](28*$s), [float](50*$s), -60, 120)

    $w2 = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(180,255,255,255), [float](12*$s))
    $w2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $w2.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($w2, [float](198*$s), [float](82*$s), [float](34*$s), [float](92*$s), -65, 130)

    $w3 = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(110,255,255,255), [float](10*$s))
    $w3.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $w3.EndCap   = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($w3, [float](216*$s), [float](62*$s), [float](36*$s), [float](132*$s), -68, 136)

    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Created: $outPath"
}

$dir = $PSScriptRoot + "\www"
Draw-Icon 192 "$dir\icon-192.png"
Draw-Icon 512 "$dir\icon-512.png"
Write-Host "Done."
