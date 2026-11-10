<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class QrController extends Controller
{
    /**
     * Generate dynamic SVG/PNG QR Code for a restaurant slug.
     */
    public function generateSvg(string $slug): Response
    {
        $restaurant = Restaurant::where('slug', $slug)->firstOrFail();
        $targetUrl = url('/m/' . $restaurant->slug);

        $renderer = new ImageRenderer(
            new RendererStyle(400, 1),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);
        $svg = $writer->writeString($targetUrl);

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * Printable Table Tent / Counter Stand view (optimized for mobile & print to PDF).
     */
    public function printableStand(string $slug): Response
    {
        $restaurant = Restaurant::where('slug', $slug)->firstOrFail();
        $targetUrl = url('/m/' . $restaurant->slug);

        $renderer = new ImageRenderer(
            new RendererStyle(350, 2),
            new SvgImageBackEnd()
        );
        $writer = new Writer($renderer);
        $svgQr = $writer->writeString($targetUrl);

        $html = view('print.stand', [
            'restaurant' => $restaurant,
            'targetUrl' => $targetUrl,
            'svgQr' => $svgQr,
        ])->render();

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
        ]);
    }
}
