import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {  TicketsService } from '../data-access/tickets.service';
import { TemplateCreate, TemplateService } from '../data-access/template.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-template-ticket',
    standalone:true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule, DragDropModule],
    templateUrl: './template-ticket.component.html',
    styleUrl: './template-ticket.component.css'
})
export class TemplateTicketComponent {

  private _formBuilder = inject(FormBuilder);
  private _ticketService = inject(TicketsService);
  private _router = inject(Router);
  private _templateService = inject(TemplateService);
  
  campos: {
    tipo: 'input' | 'desplegable' | 'radio';
    control: FormControl | FormGroup;
  }[] = [];

  formTemplate = this._formBuilder.group({
    titulo: [''],
    motivo: [''],
    areaResponsable: [''],
    inputs: this._formBuilder.array([]),
    desplegables: this._formBuilder.array([]),
    radioButtons: this._formBuilder.array([])
  });

  get inputs(): FormArray {
    return this.formTemplate.get('inputs') as FormArray;
  }

  get desplegables(): FormArray {
    return this.formTemplate.get('desplegables') as FormArray;
  }

  get radioButtons(): FormArray {
    return this.formTemplate.get('radioButtons') as FormArray;
  }

  agregarInput() {
    const control = this._formBuilder.group({
      nombre: [''],  // ← editable por el usuario
      valor: ['']    // ← el contenido que luego se completará al usar el template
    });
  
    this.campos.push({ tipo: 'input', control });
  }

  eliminarInput(index: number) {
    this.inputs.removeAt(index);
  }

  agregarDesplegable() {
    const control = this._formBuilder.group({
      nombre: [''],
      opciones: this._formBuilder.array([new FormControl('')])
    });
    this.campos.push({ tipo: 'desplegable', control });
  }
  
  asFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
  
  asFormArray(control: AbstractControl): FormArray {
    return control as FormArray;
  }
  agregarRadioButtons() {
    const control = this._formBuilder.group({
      nombre: [''],
      seleccion: [''],
      opciones: this._formBuilder.array([new FormControl('')])
    });
    this.campos.push({ tipo: 'radio', control });
  }
  
  eliminarCampo(index: number) {
    this.campos.splice(index, 1);
  }
  
  eliminarDesplegable(index: number) {
    this.desplegables.removeAt(index);
  }

  eliminarRadioButtons(index: number) {
    this.radioButtons.removeAt(index);
  }
  

  getOpciones(i: number): FormArray {
    return (this.campos[i].control as FormGroup).get('opciones') as FormArray;
  }
  
  agregarOpcion(index: number) {
    this.getOpciones(index).push(new FormControl(''));
  }
  
  eliminarOpcion(index: number, opcionIndex: number) {
    this.getOpciones(index).removeAt(opcionIndex);
  }

  getOpcionesRadio(i: number): FormArray {
    return this.radioButtons.at(i).get('opciones') as FormArray;
  }
  
  agregarOpcionRadio(index: number) {
    this.getOpcionesRadio(index).push(new FormControl(''));
  }
  
  eliminarOpcionRadio(radioIndex: number, opcionIndex: number) {
    this.getOpcionesRadio(radioIndex).removeAt(opcionIndex);
  }

  reordenarCampos(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.campos, event.previousIndex, event.currentIndex);
  }

  async guardarTemplate() {
    if (this.formTemplate.invalid) return;
  
    try {
      const titulo = this.formTemplate.get('titulo')?.value || '';
      const motivo = this.formTemplate.get('motivo')?.value || '';
      const areaResponsable = this.formTemplate.get('areaResponsable')?.value || '';
  
      // Construir los campos ordenados
      const camposOrdenados: TemplateCreate["campos"] = this.campos.map(campo => {
        switch (campo.tipo) {
          case 'input':
            const grupoI = campo.control as FormGroup;
            return {
              tipo: 'input',
              nombre: grupoI.get('nombre')?.value || '',
              valor: grupoI.get('valor')?.value || ''
            } as const;
      
          case 'desplegable':
            const grupoD = campo.control as FormGroup;
            return {
              tipo: 'desplegable',
              nombre: grupoD.get('nombre')?.value || '',
              opciones: (grupoD.get('opciones') as FormArray).controls
                .map(ctrl => ctrl.value)
                .filter((o: string) => o && o.trim() !== '')
            } as const;
      
          case 'radio':
            const grupoR = campo.control as FormGroup;
            return {
              tipo: 'radio',
              nombre: grupoR.get('nombre')?.value || '',
              seleccion: grupoR.get('seleccion')?.value || '',
              opciones: (grupoR.get('opciones') as FormArray).controls
                .map(ctrl => ctrl.value)
                .filter((o: string) => o && o.trim() !== '')
            } as const;
      
          default:
            throw new Error(`Tipo de campo desconocido: ${campo.tipo}`);
        }
      });
       
  
      // Objeto final para guardar
      const template: TemplateCreate = {
        titulo,
        motivo,
        areaResponsable,
        campos: camposOrdenados
      };
  
      await this._templateService.createTemplate(template);
      this._router.navigate(['']);
    } catch (error) {
      alert('Error al crear template');
      console.error(error);
    }
  }
  
  

  volverAtras(){
    this._router.navigate(['']);
  }
}
