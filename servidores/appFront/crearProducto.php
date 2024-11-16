<?php
$nombre = $_POST["nombre"];
$precio = $_POST["precio"];
$inventario = $_POST["inventario"];

// URL de la solicitud POST
$url = 'http://192.168.100.2:3001/productos'; // Cambia la IP si es necesario

// Datos que se enviarán en la solicitud POST
$data = array(
    'nombre' => $nombre,
    'precio' => $precio,
    'inventario' => $inventario
);
$json_data = json_encode($data);

// Imprimir datos JSON para verificar formato
echo "<pre>";
print_r($json_data);
echo "</pre>";

// Inicializar cURL
$ch = curl_init($url);

// Configurar opciones de cURL
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $json_data);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Ejecutar la solicitud POST
$response = curl_exec($ch);
print_r($response);

// Verificar errores de cURL
if ($response === false) {
    $error_msg = curl_error($ch);  // Captura el error de cURL
    curl_close($ch);
    die("Error en la conexión o en la solicitud: " . $error_msg); // Muestra el error y detiene el script
}

// Decodificar respuesta para ver si hubo éxito en la operación
$response_data = json_decode($response, true);
if (isset($response_data['error'])) {
    die("Error del servidor: " . $response_data['error']);
}

// Cerrar la conexión cURL
curl_close($ch);

// Redirigir de vuelta a index.php si la solicitud fue exitosa
header("Location: index.php");
exit;
?>