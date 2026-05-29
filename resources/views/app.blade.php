<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="csrf-token" content="{{ csrf_token() }}" />
  @viteReactRefresh
  @vite(['resources/js/app.jsx'])
  @inertiaHead
</head>
<body class="bg-gray-50 font-sans antialiased">
  @inertia
</body>
</html>