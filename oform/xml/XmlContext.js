/*
 * (c) Copyright Ascensio System SIA 2010-2019
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
	const PATH_USERS         = "/users/";
	const PATH_USER_MASTERS  = "/userMasters/";
	const PATH_FIELDS        = "/fields/";
	const PATH_FIELD_MASTERS = "/fieldMasters/";
	
	/**
	 * Класс для работы с ссылками внутри xml структуры
	 * @constructor
	 */
	function XmlContext(pkg)
	{
		this.pkg = pkg;
		
		this.pathToUser        = {};
		this.pathToUserMaster  = {};
		this.pathToField       = {};
		this.pathToFieldMaster = {};
	}
	XmlContext.prototype.getUser = function(path)
	{
		let user = this.pathToUser[path];
		if (user)
			return user;
		
		let reader = this.getXmlReader(path);
		if (!reader)
			return null;
		
		user = AscOForm.CUser.fromXml(reader);
		this.pathToUser[path] = user;
		return user;
	};
	XmlContext.prototype.getUserMaster = function(path)
	{
		let userMaster = this.pathToUserMaster[path];
		if (userMaster)
			return userMaster;
		
		let reader = this.getXmlReader(path);
		if (!reader)
			return null;
		
		userMaster = AscOForm.CUserMaster.fromXml(reader);
		this.pathToUserMaster[path] = userMaster;
		return userMaster;
	};
	XmlContext.prototype.getField = function(path)
	{
		let field = this.pathToField[path];
		if (field)
			return field;
		
		let reader = this.getXmlReader(path);
		if (!reader)
			return null;
		
		return null;

		// TODO: implement
		// field = AscOForm.CField.fromXml(reader);
		// this.pathToField[path] = field;
		// return field;
	};
	XmlContext.prototype.getFieldMaster = function(path)
	{
		let fieldMaster = this.pathToFieldMaster[path];
		if (fieldMaster)
			return fieldMaster;
		
		let reader = this.getXmlReader(path);
		if (!reader)
			return null;
		
		fieldMaster = AscOForm.CFieldMaster.fromXml(reader);
		this.pathToFieldMaster[path] = fieldMaster;
		return fieldMaster;
	};
	XmlContext.prototype.getAllUsers = function()
	{
		return this.getAllByMapAndPath(this.pathToUser, PATH_USERS, AscOForm.CUser.fromXml);
	};
	XmlContext.prototype.getAllUserMasters = function()
	{
		return this.getAllByMapAndPath(this.pathToUserMaster, PATH_USER_MASTERS, AscOForm.CUserMaster.fromXml);
	};
	XmlContext.prototype.getAllFields = function()
	{
		// TODO: Implement
		return [];
		//return this.getAllByMapAndPath(this.pathToField, PATH_FIELDS, AscOForm.CField.fromXml);
	};
	XmlContext.prototype.getAllFieldMasters = function()
	{
		return this.getAllByMapAndPath(this.pathToFieldMaster, PATH_FIELD_MASTERS, AscOForm.CFieldMaster.fromXml);
	};
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Private area
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	XmlContext.prototype.getXmlReader = function(path)
	{
		let part = this.pkg.getPartByUri(path);
		if (!part)
			return null;
		
		let partContent = part.getDocumentContent();
		if (!partContent)
			return null;
		
		return new AscCommon.StaxParser(partContent, part, this);
	};
	XmlContext.prototype.getAllByMapAndPath = function(map, path, fromXml)
	{
		let result = [];
		for (let key in map)
		{
			result.push(map[key]);
		}
		
		for (let uri in this.pkg.parts)
		{
			if (uri.startsWith(path)
				&& uri.endsWith(".xml")
				&& !map[uri])
			{
				let reader = this.getXmlReader(uri);
				if (!reader)
					return;
				
				let element = fromXml(reader);
				if (element)
					result.push(element);
			}
		}
		
		return result;
	}
	//--------------------------------------------------------export----------------------------------------------------
	AscOForm.XmlContext = XmlContext;
	
})(window);
