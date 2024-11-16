<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
          crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" 
            crossorigin="anonymous"></script>
    <title>Gestión de Productos</title>
</head>
<body>
    <div class="container">
        <h1 class="mt-4">Listado de Productos</h1>
        <table class="table mt-4">
            <thead>
                <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Inventario</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $servurl = "http://192.168.100.2:3001/productos/";

                // Prueba usando file_get_contents como alternativa
                $response = file_get_contents($servurl);
                if ($response === false) {
                    die("Error al obtener los datos");
                }

                // Mostrar el contenido de la respuesta para verificar que llega correctamente
                echo "<pre>";
                print_r($response);
                echo "</pre>";

                $resp = json_decode($response);

                if ($resp === null) {
                    die("Error al decodificar la respuesta JSON");
                }

                $long = count($resp);
                for ($i = 0; $i < $long; $i++) {
                    $dec = $resp[$i];
                    $id = htmlspecialchars($dec->id);
                    $nombre = htmlspecialchars($dec->nombre);
                    $precio = htmlspecialchars($dec->precio);
                    $inventario = htmlspecialchars($dec->inventario);
                ?>
                    <tr>
                        <td><?php echo $id; ?></td>
                        <td><?php echo $nombre; ?></td>
                        <td><?php echo $precio; ?></td>
                        <td><?php echo $inventario; ?></td>
                    </tr>
                <?php
                }
                ?>
            </tbody>
        </table>

        <!-- Botón para abrir el modal -->
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
            CREAR PRODUCTO
        </button>

        <!-- Modal para crear un nuevo producto -->
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">CREAR PRODUCTO</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form action="crearProducto.php" method="post">
                            <div class="mb-3">
                                <label for="nombre" class="form-label">Nombre</label>
                                <input type="text" name="nombre" class="form-control" id="nombre" required>
                            </div>
                            <div class="mb-3">
                                <label for="precio" class="form-label">Precio</label>
                                <input type="text" name="precio" class="form-control" id="precio" required>
                            </div>
                            <div class="mb-3">
                                <label for="inventario" class="form-label">Inventario</label>
                                <input type="text" name="inventario" class="form-control" id="inventario" required>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                                <button type="submit" class="btn btn-primary">Crear Producto</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>