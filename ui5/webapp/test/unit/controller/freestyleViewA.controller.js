/*global QUnit*/

sap.ui.define([
	"com/umang/ui5/controller/freestyleViewA.controller"
], function (Controller) {
	"use strict";

	QUnit.module("freestyleViewA Controller");

	QUnit.test("I should test the freestyleViewA controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
