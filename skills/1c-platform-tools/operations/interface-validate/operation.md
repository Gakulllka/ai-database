# /interface-validate — валидация CommandInterface.xml

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `<CIPath> [-Detailed] [-MaxErrors 30]`.

Проверяет XML командного интерфейса на структурные ошибки: корневой элемент, допустимые секции, порядок, формат ссылок на команды, дубликаты.

## Параметры

| Параметр  | Обяз. | Умолч. | Описание                                |
|-----------|:-----:|---------|-----------------------------------------|
| CIPath    | да    | —       | Путь к CommandInterface.xml             |
| Detailed  | нет   | —       | Подробный вывод (все проверки, включая успешные) |
| MaxErrors | нет   | 30      | Остановиться после N ошибок              |
| OutFile   | нет   | —       | Записать результат в файл (UTF-8 BOM)   |

## Команда

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/interface-validate.ps1" -CIPath "Subsystems/Продажи"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/interface-validate.ps1" -CIPath "Subsystems/Продажи/Ext/CommandInterface.xml"
```
