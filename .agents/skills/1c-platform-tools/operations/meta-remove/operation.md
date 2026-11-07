# /meta-remove — удаление объекта метаданных

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `<ConfigDir> -Object <Type.Name>`.

Безопасно удаляет объект из XML-выгрузки конфигурации. Перед удалением проверяет ссылки на объект в реквизитах, коде и других метаданных. Если ссылки найдены — удаление блокируется.

## Использование

```
/meta-remove <ConfigDir> -Object <Type.Name>
```

## Параметры

| Параметр   | Обязательный | Описание                                        |
|------------|:------------:|-------------------------------------------------|
| ConfigDir  | да           | Корневая директория выгрузки (где Configuration.xml) |
| Object     | да           | Тип и имя объекта: `Catalog.Товары`, `Document.Заказ` и т.д. Таблица внешнего источника — четырьмя частями: `ExternalDataSource.PG.Table.products` |
| DryRun     | нет          | Только показать что будет удалено, без изменений |
| KeepFiles  | нет          | Не удалять файлы, только дерегистрировать       |
| Force      | нет          | Удалить несмотря на найденные ссылки; ссылки на формы объекта при этом очищаются |

## Команда

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/meta-remove.ps1" -ConfigDir "<путь>" -Object "Catalog.Товары"
```

## Поддерживаемые типы

Catalog, Document, Enum, Constant, InformationRegister, AccumulationRegister, AccountingRegister, CalculationRegister, ChartOfAccounts, ChartOfCharacteristicTypes, ChartOfCalculationTypes, BusinessProcess, Task, ExchangePlan, DocumentJournal, Report, DataProcessor, CommonModule, ScheduledJob, EventSubscription, HTTPService, WebService, DefinedType, Role, Subsystem, CommonForm, CommonTemplate, CommonPicture, CommonAttribute, SessionParameter, FunctionalOption, FunctionalOptionsParameter, Sequence, FilterCriterion, SettingsStorage, XDTOPackage, WSReference, StyleItem, Language

## Примеры

```powershell
# Проверка ссылок + dry run
... -ConfigDir C:\WS\tasks\cfsrc\acc_8.3.24 -Object "Catalog.Устаревший" -DryRun

# Удалить объект без ссылок
... -ConfigDir C:\WS\tasks\cfsrc\acc_8.3.24 -Object "Catalog.Устаревший"

# Принудительно удалить несмотря на ссылки
... -ConfigDir C:\WS\tasks\cfsrc\acc_8.3.24 -Object "Catalog.Устаревший" -Force

# Только дерегистрировать (файлы оставить)
... -ConfigDir C:\WS\tasks\cfsrc\acc_8.3.24 -Object "Report.Старый" -KeepFiles

# Удалить общий модуль
... -ConfigDir src -Object "CommonModule.МойМодуль"
```
