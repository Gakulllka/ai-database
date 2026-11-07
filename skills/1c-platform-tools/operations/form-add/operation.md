# /form-add — Добавление формы к объекту конфигурации

Это справочник операции из пользовательского архива Codex_1C_Workspace_v3, адаптированный для ECC.

Запускай команды из рабочего каталога проекта-потребителя. Пути к ресурсам ниже
разрешай относительно этого `operation.md` и передавай исполнителю абсолютными;
не меняй рабочий каталог на общую Database. Например, `./scripts/` — ресурсы
этой операции, `../cf-info/scripts/` — ресурсы соседней операции. Указанные
в исходном тексте `/имена` обозначают операции, а не зарегистрированные slash-команды.

Аргументы исходной операции: `<ObjectPath> <FormName> [-Purpose <Purpose>] [-Synonym <Synonym>] [-SetDefault]`.

Создаёт управляемую форму (metadata XML + Form.xml + Module.bsl) и регистрирует её в корневом XML объекта конфигурации (Document, Catalog, InformationRegister и др.).

## Usage

```
/form-add <ObjectPath> <FormName> [-Purpose <Purpose>] [-Synonym <Synonym>] [-SetDefault]
```

| Параметр    | Обязательный | По умолчанию | Описание                                     |
|-------------|:------------:|--------------|----------------------------------------------|
| ObjectPath  | да           | —            | Путь к XML-файлу объекта (Documents/Док.xml)  |
| FormName    | да           | —            | Имя формы (ФормаДокумента)                    |
| Purpose     | нет          | основная форма вида | Назначение формы — см. таблицу ниже: у справочника это форма объекта, у регистра сведений — форма записи, у журнала — форма списка |
| Synonym     | нет          | = FormName   | Синоним формы                                 |
| -SetDefault | нет          | авто         | Сделать основной. Без флага основной становится первая форма каждого назначения |

## Команда

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "./scripts/form-add.ps1" -ObjectPath "<ObjectPath>" -FormName "<FormName>" [-Purpose "<Purpose>"] [-Synonym "<Synonym>"] [-SetDefault]
```

## Purpose — назначение формы

| Purpose | Какая форма | Становится основной |
|---------|-------------|---------------------|
| Object | форма объекта (элемента, документа, обработки) | да |
| List | форма списка | да |
| Choice | форма выбора | да |
| Folder | форма группы | да |
| FolderChoice | форма выбора группы | да |
| Record | форма записи | да |
| RecordSet | форма набора записей | нет — в платформе нет такого свойства |
| Save | форма сохранения настроек | да |
| Load | форма загрузки настроек | да |
| Custom | произвольная форма, без привязки к объекту | нет |

### Что доступно типу объекта

| Тип объекта | Назначения |
|-------------|------------|
| Catalog, ChartOfCharacteristicTypes | Object, Folder, List, Choice, FolderChoice, Custom |
| Document, ChartOfAccounts, ChartOfCalculationTypes, ExchangePlan, BusinessProcess, Task | Object, List, Choice, Custom |
| DataProcessor, Report, ExternalDataProcessor, ExternalReport | Object, Custom |
| InformationRegister | Record, List, RecordSet, Custom |
| AccumulationRegister, AccountingRegister, CalculationRegister | List, RecordSet, Custom |
| DocumentJournal, FilterCriterion | List, Custom |
| Enum | List, Choice, Custom |
| SettingsStorage | Save, Load, Custom |
| Table (таблица внешнего источника) | `tableDataType=ObjectData` — Object, List, Choice, Custom; `NonobjectData` — Record, List, Choice, Custom |

Недопустимое сочетание отклоняется со списком доступных для этого типа. У константы собственных
форм нет — для неё используется общая форма (`CommonForm`).

Таблица внешнего источника адресуется файлом таблицы:
`ExternalDataSources/<Источник>/Tables/<Таблица>.xml`. Ссылки в такой форме трёхчастные;
без `-Purpose` берётся форма объекта, а у таблицы с составным ключом — форма записи.

## Примеры

```
# Форма документа
/form-add Documents/АвансовыйОтчет.xml ФормаДокумента -Purpose Object

# Форма списка каталога
/form-add Catalogs/Контрагенты.xml ФормаСписка -Purpose List

# Форма записи регистра сведений
/form-add InformationRegisters/КурсыВалют.xml ФормаЗаписи -Purpose Record

# Форма выбора с синонимом
/form-add Catalogs/Номенклатура.xml ФормаВыбора -Purpose Choice -Synonym "Выбор номенклатуры"

# Установить как форму по умолчанию
/form-add Documents/Заказ.xml ФормаДокументаНовая -Purpose Object -SetDefault
```

## Workflow

1. `/form-add` — создать каркас формы
2. `/form-compile` или `/form-edit` — наполнить Form.xml элементами
3. `/form-validate` — проверить корректность
4. `/form-info` — проанализировать результат
