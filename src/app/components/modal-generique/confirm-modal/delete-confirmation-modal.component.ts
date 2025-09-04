import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';


@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  // styleUrls: ['./delete-confirmation-modal.component.css'],
  imports: [MatCardModule, MatButtonModule]
})
export class DeleteConfirmationModalComponent {

  constructor(
    public dialogRef: MatDialogRef<DeleteConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Données passées au composant
  ) { }

  // Méthode pour fermer la modale avec confirmation (supprimer)
  confirmDelete(): void {
    this.dialogRef.close(true); // Renvoie true à la fermeture pour confirmer la suppression
  }

  // Méthode pour fermer la modale sans confirmation (annuler)
  cancelDelete(): void {
    this.dialogRef.close(false); // Renvoie false à la fermeture pour annuler
  }
}
