sap.ui.define([], function () {
	"use strict";

	return {
		// Format a date-ish value to locale date string (fallback: empty string)
		formatDate: function (vDate) {
			if (!vDate) {
				return "";
			}
			try {
				var d = (vDate instanceof Date) ? vDate : new Date(vDate);
				return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(d);
			} catch (e) {
				return "";
			}
		},

		// Format a number as currency. usage: formatCurrency(amount, "USD")
		formatCurrency: function (vAmount, sCurrency) {
			if (vAmount === null || vAmount === undefined || isNaN(vAmount)) {
				return "";
			}
			try {
				var opts = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
				if (sCurrency) {
					opts.style = "currency";
					opts.currency = sCurrency;
				}
				return new Intl.NumberFormat(undefined, opts).format(Number(vAmount));
			} catch (e) {
				return String(vAmount);
			}
		},

		// Map boolean-ish values to SAP icons (useful in icon control bindings)
		booleanIcon: function (v) {
			// truthy => accept, falsy => decline, null/undefined => question
			if (v === null || v === undefined) {
				return "sap-icon://question-mark";
			}
			return v ? "sap-icon://accept" : "sap-icon://decline";
		},

		// Trim/ellipsis text to a maximum length (default 100)
		trimText: function (sText, iMax) {
			if (!sText && sText !== 0) {
				return "";
			}
			var str = String(sText);
			var max = parseInt(iMax, 10) || 100;
			if (str.length <= max) {
				return str;
			}
			return str.slice(0, max - 1).trim() + "\u2026";
		},

		// Format quantity with optional unit (e.g., "12.00 kg")
		formatQuantity: function (vQty, sUnit, iDecimals) {
			if (vQty === null || vQty === undefined || isNaN(vQty)) {
				return "";
			}
			var dec = (typeof iDecimals === "number") ? iDecimals : 2;
			var num = Number(vQty).toFixed(dec);
			return sUnit ? num + " " + sUnit : num;
		}
	};
});