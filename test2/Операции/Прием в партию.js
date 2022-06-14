_operation = {
	"version": "1.0",
	"name": "JoinParty",
	"title": {
		"ru": "Прием в партию"
	},
	"category": {
		"name": "Notices",
		"title": {
			"ru": "Заявления"
		}
	},
	"subcategory": {
		"name": "NewPartyMember",
		"title": {
			"ru": "Прием в члены партии"
		}
	},
	"fields": [{
			"name": "FullName",
			"title": {
				"ru": "Ф.И.О."
			},
			"type": "text"
		},
		{
			"name": "Passport",
			"title": {
				"ru": "Паспорт"
			},
			"type": "text"
		},
		{
			"name": "Scan",
			"title": {
				"ru": "Скан заявления"
			},
			"type": "file"
		},
		{
			"name": "Comments",
			"title": {
				"ru": "Комментарии"
			},
			"type": "textarea"
		},
		{
			"name": "AdditionalFiles",
			"title": {
				"ru": "Дополнительные файлы"
			},
			"type": "file",
			"attributes": [{
				"name": "multiple",
				"value": ""
			}]
		}
	]
};