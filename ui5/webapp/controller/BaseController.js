/**
 * Date: Feb 1, 2024
 * Author: Umang Rustagi
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], function (Controller, UIComponent) {
    "use strict";
    return Controller.extend('com.umang.ui5.BaseController', {
        onInit: function () {
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getModel: function (sName) {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        getResourceBundle: function () {
            var oOwner = UIComponent.getOwnerComponentFor(this);
            return oOwner && oOwner.getModel("i18n") && oOwner.getModel("i18n").getResourceBundle();
        },
        getBaseController: function(){
            return Controller;
        },
        // Service Model Methods (Fetch/Post) ODataV2
        getServiceDetails: async function(aFilters){
            var oServiceModel = this.getOwnerComponent().getModel("serviceModel");
            return await new Promise((resolve, reject) => {
                oServiceModel.read("/ServiceDetails", {
                    async: true,
                    filters: [aFilters],
                    urlParameters: {
                        "$expand": "ToServiceItems,ToServiceOtherEntity"
                    },
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });
            });
        },
        postServiceDetails: async function(oPayload){
            var oServiceModel = this.getOwnerComponent().getModel("serviceModel");
            return await new Promise((resolve, reject) => {
                oServiceModel.create("/ServiceDetails", oPayload, {
                    async: true,
                    success: function(oData) {
                        resolve(oData);
                    },
                    error: function(oError) {
                        reject(oError);
                    }
                });    
            });
        },
        //Non-Standard Export to Excel Method
        exportUITableToExcel: function(oTable, sFileName){
            var oSpreadsheet = new sap.ui.export.Spreadsheet({
                workbook: {
                    columns: oTable.getColumns().map(function(oColumn) {
                        return {
                            label: oColumn.getLabel().getText(),
                            property: oColumn.getSortProperty() || oColumn.getFilterProperty(),
                            type: 'string'
                        };
                    })
                },
                dataSource: oTable.getBinding("items").getContexts().map(function(oContext) {
                    return oTable.getBinding("items").getModel().getObject(oContext.getPath());
                }),
                fileName: sFileName || "Export.xlsx"
            });
            oSpreadsheet.build().finally(function() {
                oSpreadsheet.destroy();
            });
        },
        //Export UI Table to Excel using Custom Column Configuration
        exportCustomConfiguration: function(oTable){
            //If Binding needs to be for SAPUI5 sap.ui.table.Table 
            var oBinding = oTable.getBinding("rows");
            var aColumnConfig = [
                {
                    label: this.getServiceLabels('Field1'), 
                    property: 'Field1',
                    type: sap.ui.export.library.EdmType.String
                },
                {
                    label: this.getServiceLabels('Field2'), 
                    property: 'Field2',
                    type: sap.ui.export.library.EdmType.DateTime
                }
            ]
            return [aColumnConfig, oBinding, sFileName];
        },
        exportUITableToExcelWithConfig: function(oTable, aColumnConfig, sFileName){
            var [aColumnConfig, oBinding, sFileName] = this.exportCustomConfiguration();
            var oSpreadsheet = new sap.ui.export.Spreadsheet({
                workbook: {
                    columns: aColumnConfig
                },
                dataSource: oBinding,
                fileName: sFileName || "Export.xlsx"
            });
            oSpreadsheet.build().finally(function() {
                oSpreadsheet.destroy();
            });
        },
        //Get Service Level
        getServiceLabels: function(sField){
            var oServiceModel = this.getOwnerComponent().getModel("serviceModel");
            if(oServiceModel.getProperty("/ServiceEntityName/" + sField + '/@sap:label')){
                return oServiceModel.getProperty("/ServiceEntityName/" + sField + '/@sap:label')
            }
            return sField;
        },
        //Update Model Bindings if data is changed
        updateViewBindings: function(bForced){
            this.getOwnerComponent().getModel('ModelName').updateBindings(bForced);
        },
        //Navigation Method
        routeToNavigation: function(sRouteName, oParams){
            this.getRouter().navTo(sRouteName, oParams);
            /**
             * //Another way to navigate
             * return sap.ui.core.UIComponent.getRouterFor(this).navTo(sRouteName, oParams);
             */ 
        },
        //Get OData V2 Service Error Message
        getODataV2ServiceMessage: function(oError){
            var sMessage = "Unknown error occurred.";
            try {
                var oErrorResponse = JSON.parse(oError.responseText);
                if (oErrorResponse && oErrorResponse.error && oErrorResponse.error.message && oErrorResponse.error.message.value) {
                    sMessage = oErrorResponse.error.message.value;
                }
            } catch (e) {
                // Fallback to default message
            }
            return sMessage;
        },
        //Get OData V4 Service Error Message
        getODataV4ServiceMessage: function(oError){
            var sMessage = "Unknown error occurred.";
            try {
                var oErrorResponse = JSON.parse(oError.responseText);
                if (oErrorResponse && oErrorResponse.error && oErrorResponse.error.message) {
                    sMessage = oErrorResponse.error.message;
                }
            } catch (e) {
                // Fallback to default message
            }
            return sMessage;
        },
        getCustomServiceMessage: function(oError){
            if(oError && oError.statusCode){
                if(oError.statusCode === 400){
                    return "Bad Request - The server could not understand the request due to invalid syntax.";
                } else if(oError.statusCode === 401){
                    return "Unauthorized - The client must authenticate itself to get the requested response.";
                } else if(oError.statusCode === 403){
                    return "Forbidden - The client does not have access rights to the content.";
                } else if(oError.statusCode === 404){
                    return "Not Found - The server can not find the requested resource.";
                } else if(oError.statusCode === 500){
                    return "Internal Server Error - The server has encountered a situation it doesn't know how to handle.";
                } else {
                    return "Error " + oError.statusCode + " - An unexpected error occurred.";
                }
            } else {
                var sMessage = $(oError.responseText).find('message').first().text();
                return sMessage || "An unknown error occurred.";
            }
        },
        //Open Error Message Box
        showErrorMessage: function(sMessage, sTitle, oError){
            sap.m.MessageBox.error(oError ? this.getCustomServiceMessage(oError): 'An Error has Occured', {
                title: sTitle || "An Error has Occurred",
                actions: [sap.m.MessageBox.Action.OK],
                emphasizedAction: sap.m.MessageBox.Action.OK
            });
        },
        //Cross Application Navigation   
        crossAppNavigationToExternalApp: function(sSemanticObject, sAction, oParams, bNewTab){  
            var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
            var hash = (oCrossAppNavigator && oCrossAppNavigator.hrefForExternal({
                target: {
                    semanticObject: sSemanticObject,
                    action: sAction
                },
                params: oParams
            })) || ""; 
            if(hash){
                if(bNewTab){
                    window.open(hash, "_blank");
                    return;
                }
                window.location.href = hash;
                //URL can be window.location.origin + window.location.pathname + "#" + hash;
                //Alternatively window.location.origin + window.location.pathname + hash;
            } else {
                sap.m.MessageToast.show("Navigation target not found.");
            }
        },
        // Generic Message Box
        openMessageBox: function(sMessage, sTitle, sType){ 
            var oMessageBox = sap.m.MessageBox;
            var oMessageBoxType = sType === "error" ? oMessageBox.Type.ERROR :
                                    sType === "warning" ? oMessageBox.Type.WARNING :    
                                    sType === "information" ? oMessageBox.Type.INFORMATION :
                                    oMessageBox.Type.NONE;
            oMessageBox.show(sMessage, {
                icon: oMessageBoxType,
                title: sTitle || "Message",
                actions: [oMessageBox.Action.OK],
                emphasizedAction: oMessageBox.Action.OK
            });
        },
        //Load and Open Fragment in Dialog
        openFragmentInDialog: function(sFragmentName, oController){
            var oView = this.getView();
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment(oView.getId(), sFragmentName, oController || this);
                oView.addDependent(this._oDialog);
            }
            this._oDialog.open();
        },
        closeFragmentDialog: function(){
            if (this._oDialog) {
                this._oDialog.close();
            }
        },
        //Attachment Methods
        beforeUploadStarts: function(oUploadSet){
            if(oUploadSet){
                var oServiceModel = this.getOwnerComponent().getModel("serviceModel");
                var sToken = oServiceModel.getSecurityToken();
                oUploadSet.addHeaderParameter(new sap.m.UploadSetHeaderParameter({
                    name: "x-csrf-token",
                    value: sToken
                }));
                oUploadSet.addHeaderField(new sap.ui.core.Item({
                    key: 'slug',
                    text: encodeURIComponent(oUploadSet.getFileName())
                }));
                oUploadSet.addHeaderField(new sap.ui.core.Item({
                    key: 'Accept',
                    text: 'application/json'
                }))
            }
        },
        afterUploadCompletes: function(e){
            if(JSON.parse(e.getParameter("responseRaw")).d){
                sap.m.MessageToast.show("Upload Successful");
            } else {
                sap.m.MessageToast.show("Upload Failed");
            }
        },
        deleteAttachment: function(sAttachmentPath){
            var oServiceModel = this.getOwnerComponent().getModel("serviceModel");

            oServiceModel.remove(sAttachmentPath, {
                success: function() {
                    sap.m.MessageToast.show("Attachment deleted successfully.");
                },
                error: function() {
                    sap.m.MessageToast.show("Failed to delete attachment.");
                }
            });
        },
        openValueHelpForInput: function(sEntitySet, sTitle, sInitialVisibleFields,
            sFieldName, oInput, aShownFiltersConfig, aRebindFiltersConfig, sValueHelpName
        ){
            var oServiceModel = this.getOwnerComponent().getModel("serviceModel");
            var oBaseController = this;

            oBaseController._ValueHelpField = oInput;
            oBaseController._ValueHelpFieldName = sFieldName;
            oBaseController._ValueHelpName = sValueHelpName || "ValueHelpDialog";
            oBaseController._ValueHelpRebindFiltersConfig = aRebindFiltersConfig || [];
           
            var oSmartFilterBar = new sap.ui.comp.smartfilterbar.SmartFilterBar({
                entitySet: sEntitySet,
                liveMode: false,
                smartModelName: "serviceModel",
                advancedMode: false,
                showClearButton: true,
                showRestoreButton: true,
                showGoOnFB: true,
                useToolbar: true,
                filterBarExpanded: true,
                header: sTitle || sFieldName,
                persistencyKey: sValueHelpName + "PersistencyKey",
                initialVisibleFields: sInitialVisibleFields || "",
            });
            oSmartFilterBar.setModel(oServiceModel);

            oShownFiltersConfig.forEach(function(oFilterConfig){
                oSmartFilterBar.addC(oFilterConfig);
            });

            var oSmartTable = new sap.ui.comp.smarttable.SmartTable({
                entitySet: sEntitySet,
                tableType: "Table",
                smartModelName: "serviceModel",
                useExportToExcel: false,
                useVariantManagement: false,
                header: sTitle || sFieldName,
                persistencyKey: sValueHelpName + "TablePersistencyKey",
                showRowCount: true,
                enableAutoBinding: false,
                smartFilterId: oSmartFilterBar.getId(),
                initialVisibleFields: sInitialVisibleFields || "",
            });
            oSmartTable.attachBeforeRebindTable(oBaseController.valueHelpRebindTable, oBaseController);
            oSmartTable.setModel(oServiceModel);
            var bSmartFilterInitialized = false, bSmartTableInitialized = false;

            oSmartFilterBar.attachEventOnce("initialise", function(){
                bSmartFilterInitialized = true;
                if(bSmartFilterInitialized){
                    oSmartTable.rebindTable();
                }
            });
            oSmartTable.attachEventOnce("initialise", function(){
                var oInnerTable = oSmartTable.getTable();
                if(oInnerTable){
                    oInnerTable.setSelectionMode(sap.ui.table.SelectionMode.Single);
                    oInnerTable.setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed);
                    oInnerTable.setVisibleRowCount(5);
                    oInnerTable.setSelectionBehavior(sap.ui.table.SelectionBehavior.Row);

                    var oRowSettings = new sap.ui.table.RowSettings({
                        highlight: {path: sFieldName, formatter: function(sValue){
                            return sValue ? sap.ui.core.MessageType.Success : sap.ui.core.MessageType.None;
                        }}
                    });
                    oInnerTable.setRowSettingsTemplate(oRowSettings);
                    oInnerTable.attachRowSelectionChange(function(oEvent){
                        oBaseController.smartValueHelpChange(oEvent,oDialog);
                    });
                }
                bSmartTableInitialized = true;
                if(bSmartFilterInitialized){
                    oSmartTable.rebindTable();
                }
            });

            var oDialog = new sap.m.Dialog({
                title: sTitle || sFieldName,
                contentWidth: "80%",
                contentHeight: "80%",
                stretch: sap.ui.Device.system.phone,
                horizontalScrolling: false,
                verticalScrolling: false,
                content: [
                    new sap.m.VBox({
                        fitContainer: true,
                        items: [
                            oSmartFilterBar,
                            oSmartTable
                        ]
                    })
                ],
                beginButton: new sap.m.Button({
                    text: "OK",
                    press: function () {
                        this.close();
                    }
                }),
                afterClose: function () {
                    this.destroy();
                }
            })
            oDialog.open();  


        }
    });
});