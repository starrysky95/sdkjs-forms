/*
 * (c) Copyright Ascensio System SIA 2010-2022
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function(window)
{
	/**
     * @typedef {Object} ContentControl
	 * Content control object.
     * @property {string} Tag - A tag assigned to the content control. The same tag can be assigned to several content controls so that it is possible to make reference to them in your code.
     * @property {string} Id - A unique identifier of the content control. It can be used to search for a certain content control and make reference to it in the code.
     * @property {ContentControlLock} Lock - A value that defines if it is possible to delete and/or edit the content control or not: 0 - only deleting, 1 - no deleting or editing, 2 - only editing, 3 - full access.
     * @property {string} InternalId - A unique internal identifier of the content control. It is used for all operations with content controls.
     */

	/**
     * @typedef {(0 | 1 | 2 | 3)} ContentControlLock
     * A value that defines if it is possible to delete and/or edit the content control or not:
	 * * **0** - only deleting
	 * * **1** - disable deleting or editing
	 * * **2** - only editing
	 * * **3** - full access
     */

	/**
	 * Returns information about all the forms that have been added to the document.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias GetAllForms
	 * @returns {ContentControl[]} - An array with all the forms from the document.
	 * @example
	 * window.Asc.plugin.executeMethod("GetAllForms");
	 */
	window["asc_docs_api"].prototype["pluginMethod_GetAllForms"] = function()
	{
		let oFormsManager = this.private_GetFormsManager();
		if (!oFormsManager)
			return [];

		let arrForms  = oFormsManager.GetAllForms();
		let arrResult = [];
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			arrResult.push(arrForms[nIndex].GetContentControlPr().GetEventObject());
		}
		return arrResult;
	};
	/**
	 * Returns information about all the forms that have been added to the document with specified tag.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias GetFormsByTag
	 * @param {string} tag - The form tag.
	 * @returns {ContentControl[]} - An array with all the forms from the document with the specified tag.
	 * @example
	 * window.Asc.plugin.executeMethod("GetFormsByTag");
	 */
	window["asc_docs_api"].prototype["pluginMethod_GetFormsByTag"] = function(tag)
	{
		let oFormsManager = this.private_GetFormsManager();
		if (!oFormsManager)
			return [];

		let arrForms  = oFormsManager.GetAllForms();
		let arrResult = [];
		let oForm     = null;
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			oForm = arrForms[nIndex];
			if (oForm.GetTag() === tag)
				arrResult.push(oForm.GetContentControlPr().GetEventObject());
		}
		return arrResult;
	};
	/**
	 * Sets a value to the specified form.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias SetFormValue
	 * @param {string} internalId - A unique internal identifier of the form.
	 * @param {string | boolean} value - Form value to be set. Its type depends on the form type.
	 * @example
	 * window.Asc.plugin.executeMethod("SetFormValue");
	 */
	window["asc_docs_api"].prototype["pluginMethod_SetFormValue"] = function(internalId, value)
	{
		let oLogicDocument = this.private_GetLogicDocument();

		if (!AscCommon.g_oTableId
			|| !oLogicDocument
			|| !oLogicDocument.IsDocumentEditor())
			return;

		let oForm = AscCommon.g_oTableId.GetClass(internalId);

		if (!oForm
			|| !(oForm instanceof AscWord.CInlineLevelSdt)
			|| !oForm.IsForm())
			return;

		// При проверке лока внутри параграфа мы ориентируемся на выделение внутри этого параграфа
		// поэтому нужно выделить форму
		let state = oLogicDocument.SaveDocumentState();
		oForm.SelectContentControl();
		
		let oParagraph = oForm.GetParagraph();
		
		oForm.SkipSpecialContentControlLock(true);
		if (!oParagraph
			|| oLogicDocument.IsSelectionLocked(AscCommon.changestype_None, {
				Type      : AscCommon.changestype_2_ElementsArray_and_Type,
				Elements  : [oParagraph],
				CheckType : AscCommon.changestype_Paragraph_Content
			}, true, oLogicDocument.IsFillingFormMode()))
		{
			oLogicDocument.LoadDocumentState(state);
			oForm.SkipSpecialContentControlLock(false);
			return;
		}
		oLogicDocument.LoadDocumentState(state);
		oForm.SkipSpecialContentControlLock(false);

		oLogicDocument.StartAction(AscDFH.historydescription_Document_FillFormInPlugin);

		let isClear = false;
		if (null === value)
		{
			isClear = true;
		}
		else if (oForm.IsTextForm() || oForm.IsComboBox())
		{
			let sValue = AscBuilder.GetStringParameter(value, "");
			if (!value)
				isClear = true;
			else
				oForm.SetInnerText(sValue);
		}
		else if (oForm.IsDropDownList())
		{
			let sValue = AscBuilder.GetStringParameter(value, "");
			let oPr    = oForm.GetDropDownListPr();
			let nIndex = oPr.FindByText(sValue);
			if (-1 !== nIndex)
				oForm.SelectListItem(oPr.GetItemValue(nIndex));
			else
				isClear = true;
		}
		else if (oForm.IsCheckBox())
		{
			let isChecked = value === "true" ? true : value === "false" ? false : AscBuilder.GetBoolParameter(value, null);
			if (null !== isChecked)
				oForm.SetCheckBoxChecked(isChecked);
			else
				isClear = true;
		}
		else if (oForm.IsPictureForm())
		{
			let sValue = AscBuilder.GetStringParameter(value, "");
			if (!sValue)
				return;

			let oImg;
			let allDrawings = oForm.GetAllDrawingObjects();
			for (let nDrawing = 0; nDrawing < allDrawings.length; ++nDrawing)
			{
				if (allDrawings[nDrawing].IsPicture())
				{
					oImg = allDrawings[nDrawing].GraphicObj;
					break;
				}
			}

			if (oImg)
			{
				oForm.SetShowingPlcHdr(false);
				oImg.setBlipFill(AscFormat.CreateBlipFillRasterImageId(sValue));
			}
			else
			{
				isClear = true;
			}
		}

		if (isClear)
			oForm.ClearContentControlExt();

		oLogicDocument.OnChangeForm(oForm);
		oLogicDocument.Recalculate();
		oLogicDocument.UpdateTracks();
		oLogicDocument.FinalizeAction();
	};
	/**
	 * Returns a value of the specified form.
	 * @memberof Api
	 * @typeofeditors ["CDE"]
	 * @alias GetFormValue
	 * @param {string} internalId - A unique internal identifier of the form.
	 * @returns {null | string | boolean} The form value in the string or boolean format depending on the form type. The null value means that the form is filled with a placeholder.
	 * @example
	 * window.Asc.plugin.executeMethod("GetFormValue");
	 *
	 */
	window["asc_docs_api"].prototype["pluginMethod_GetFormValue"] = function(internalId)
	{
		if (!AscCommon.g_oTableId)
			return "";

		let oForm = AscCommon.g_oTableId.GetClass(internalId);

		if (!oForm
			|| !(oForm instanceof AscWord.CInlineLevelSdt)
			|| !oForm.IsForm())
			return "";

		if (oForm.IsPlaceHolder())
			return null;

		if (oForm.IsTextForm() || oForm.IsComboBox() || oForm.IsDropDownList())
		{
			return oForm.GetInnerText();
		}
		else if (oForm.IsCheckBox())
		{
			return oForm.IsCheckBoxChecked();
		}
		else if (oForm.IsPictureForm())
		{
			let oImg;
			let allDrawings = oForm.GetAllDrawingObjects();
			for (let nDrawing = 0; nDrawing < allDrawings.length; ++nDrawing)
			{
				if (allDrawings[nDrawing].IsPicture())
				{
					oImg = allDrawings[nDrawing].GraphicObj;
					break;
				}
			}

			if (oImg)
				return oImg.getBase64Img();
		}

		return "";
	};

})(window);
