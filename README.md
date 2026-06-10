<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мой сайт на GitHub Pages</title>
    <style>
        /* Базовые стили для страницы */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        /* Стили для шапки сайта */
        header {
            background-color: #0366d6; /* Цвет GitHub */
            color: white;
            padding: 20px;
            text-align: center;
        }
        /* Основной контейнер контента */
        .container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        /* Стили для кнопки */
        button {
            background-color: #0366d6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #0256b3;
        }
        /* Подвал сайта */
        footer {
            text-align: center;
            padding: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <!-- Шапка с заголовком -->
    <header>
        <h1>Добро пожаловать на мой сайт</h1>
        <p>Сайт размещён на GitHub Pages</p>
    </header>

    <!-- Основной контент -->
    <div class="container">
        <h2>О сайте</h2>
        <p>Это простой сайт, созданный для демонстрации работы GitHub Pages.</p>

        <!-- Кнопка с демонстрацией JavaScript -->
        <button id="clickButton">Нажми меня</button>
        <p id="outputMessage"></p>
    </div>

    <!-- Подвал с копирайтом -->
    <footer>
        <p>© 2026 Мой первый сайт на GitHub Pages</p>
    </footer>

    <script>
        // Добавление интерактивности при клике на кнопку
        document.getElementById('clickButton').addEventListener('click', function() {
            // Получение элемента для вывода сообщения
            var outputElement = document.getElementById('outputMessage');
            // Установка текста с текущим временем
            outputElement.textContent = 'Вы нажали кнопку! Время: ' + new Date().toLocaleTimeString('ru-RU');
        });
    </script>
</body>
</html>
