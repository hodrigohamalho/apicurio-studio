/**
 * @license
 * Copyright 2018 JBoss Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Component} from "@angular/core";
import {Oas20SchemaDefinition, Oas30SchemaDefinition, OasDocument, OasVisitorUtil} from "oai-ts-core";
import {EntityEditor, EntityEditorEvent, IEntityEditorHandler} from "./entity-editor.component";
import {CodeEditorMode, CodeEditorTheme} from "../../../../../../components/common/code-editor.component";
import {FindSchemaDefinitionsVisitor} from "../../_visitors/schema-definitions.visitor";


export interface DataTypeData {
    name: string;
    description: string;
    example: string;
    template: string;
}

export interface DataTypeEditorEvent extends EntityEditorEvent<Oas20SchemaDefinition | Oas30SchemaDefinition> {
    data: DataTypeData;
}

export interface IDataTypeEditorHandler extends IEntityEditorHandler<Oas20SchemaDefinition | Oas30SchemaDefinition, DataTypeEditorEvent> {
    onSave(event: DataTypeEditorEvent): void;
    onCancel(event: DataTypeEditorEvent): void;
}


@Component({
    moduleId: module.id,
    selector: "data-type-editor",
    templateUrl: "data-type-editor.component.html",
    styleUrls: ["data-type-editor.component.css"]
})
export class DataTypeEditorComponent extends EntityEditor<Oas20SchemaDefinition | Oas30SchemaDefinition, DataTypeEditorEvent> {

    protected exampleValid: boolean = true;
    protected exampleFormattable: boolean = false;

    protected defs: string[] = [];
    protected defExists: boolean = false;

    public model: DataTypeData = {
        name: "",
        description: "",
        example: null,
        template: null
    };

    public doAfterOpen(): void {
        this.defs = [];
        this.defExists = false;
        let definitions: (Oas20SchemaDefinition | Oas30SchemaDefinition)[] = this.getDefinitions(this.context.ownerDocument());
        this.defs = definitions.map(definition => FindSchemaDefinitionsVisitor.definitionName(definition));
    }

    /**
     * Initializes the editor's data model from a provided entity (initialize the editor data model from an entity).
     * @param entity
     */
    public initializeModelFromEntity(entity: Oas20SchemaDefinition | Oas30SchemaDefinition): void {
        // Note: nothing to do here because data types aren't editable via the full screen editor.
    }

    /**
     * Initializes the editor's data model to an empty state.
     */
    public initializeModel(): void {
        this.model = {
            name: "",
            description: "",
            example: null,
            template: null
        };
    }

    /**
     * Returns true if the data model is valid.
     */
    public isValid(): boolean {
        return this.model.name !== null && this.model.name.trim().length > 0 && !this.defExists && this.exampleValid;
    }

    /**
     * Creates an entity event specific to this entity editor.
     */
    public entityEvent(): DataTypeEditorEvent {
        let event: DataTypeEditorEvent = {
            entity: this.entity,
            data: this.model
        };
        return event;
    }

    get example() {
        return this.model.example;
    }

    set example(definition: string) {
        this.model.example = definition;
        if (this.model.example === "") {
            this.exampleValid = true;
            this.exampleFormattable = false;
        } else {
            try {
                JSON.parse(this.model.example);
                this.exampleValid = true;
                this.exampleFormattable = true;
            } catch (e) {
                this.exampleValid = false;
                this.exampleFormattable = false;
            }
        }
    }

    /**
     * Returns true if it's possible to format the example definition (it must be non-null and
     * syntactically valid).
     * @return
     */
    public isExampleDefinitionFormattable(): boolean {
        return this.exampleFormattable;
    }

    /**
     * Returns true if the example definition added by the user in the Add Definition modal
     * dialog is valid (syntactically).
     * @return
     */
    public isExampleDefinitionValid(): boolean {
        return this.exampleValid;
    }

    /**
     * Called to format the example definition.
     */
    public formatExampleDefinition(): void {
        let jsObj: any = JSON.parse(this.example);
        let nsrcStr: string = JSON.stringify(jsObj, null, 4);
        this.example = nsrcStr;
    }

    public exampleEditorTheme(): CodeEditorTheme {
        return CodeEditorTheme.Light;
    }

    public exampleEditorMode(): CodeEditorMode {
        return CodeEditorMode.JSON;
    }

    private getDefinitions(document: OasDocument): (Oas20SchemaDefinition | Oas30SchemaDefinition)[] {
        let vizzy: FindSchemaDefinitionsVisitor = new FindSchemaDefinitionsVisitor(null);
        OasVisitorUtil.visitTree(document, vizzy);
        return vizzy.getSortedSchemaDefinitions()
    }

}
