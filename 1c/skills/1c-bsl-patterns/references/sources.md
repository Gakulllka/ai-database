# Primary Sources for 1C / BSL

Проверено чтением первичных страниц: 2026-11-07. Это указатели для проверки решений,
а не копия руководств. Документация конкретной установленной версии платформы,
синтакс-помощник и исходники встроенной библиотеки определяют доступный API.

| Тема | Первичный источник | Когда читать |
|---|---|---|
| Контексты управляемых форм | [1Ci: compilation directives](https://kb.1ci.com/1C_Enterprise_Platform/FAQ/Development/Compilation_directives/Compilation_directives_Differences/) | Выбор клиента, сервера и серверного вызова без контекста формы |
| Ссылки, объекты и наборы записей | [1C: applied objects](https://1c-dn.com/library/using_script_tools_for_working_with_applied_objects/) | Различение чтения, изменения объекта и сохранения |
| Параметры запросов и производительность | [1C: optimizing client/server solutions](https://1c-dn.com/library/optimizing_client_server_applied_solutions_for_SaaS_mode/) | Передача значений параметрами, длительность транзакций, проверка узких мест |
| Обработка исключений | [1C: catching exceptions](https://1c-dn.com/library/catching_exceptions_in_1c_enterprise_script/) | Диагностика, повторная передача ошибки и осмысленный перехват |
| Явные и неявные транзакции | [1C: script execution process](https://1c-dn.com/library/1C_Enterprise_script_execution_process/) | Владение транзакцией и влияние границ вызова |
| Фиксация, откат и повторная передача | [1Ci: library integration guide](https://kb.1ci.com/1C_Standard_Subsystems_Library/Guides/1C_Standard_Subsystems_Developer_Guide/Chapter_2._Library_integration_guide/) | Найти `RollbackTransaction` и соответствующий контекст примера |
| Права и RLS | [1C: access restriction concepts](https://1c-dn.com/library/data_access_restrictions_operating_concepts_overview/) | Семантика полного/разрешённого набора данных, привилегированные модули |
| БСП / SSL | [1C: library subsystems](https://1c-dn.com/library/chapter_1_library_subsystems/) | Проверка требований библиотеки и варианта интеграции; версии сверять с поставкой |
| Статические диагностики | [BSL Language Server: configuration](https://1c-syntax.github.io/bsl-language-server/en/features/ConfigurationFile/) | Использование конфигурации конкретного workspace и настроенных диагностик |

Примеры в `SKILL.md` составлены для этого навыка. Они используют условные имена
метаданных и требуют адаптации к проекту. Чтение документов и статический анализ
не подтверждают компиляцию, права, многосеансовое поведение или расчёты в реальной ИБ.
