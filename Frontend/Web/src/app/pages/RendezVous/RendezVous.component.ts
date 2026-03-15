import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { RdvService } from "../../core/services/rdv.service";
import { RdvCreateDto } from "../../core/models/rdv.model";
import { Router } from "@angular/router";
import { PageBreadcrumbComponent } from "../../shared/components/common/page-breadcrumb/page-breadcrumb.component";
import { ComponentCardComponent } from "../../shared/components/common/component-card/component-card.component";
import {
  BasicTableThreeComponent,
  RendezVousRow,
} from "../../shared/components/tables/basic-table-three/basic-table-three.component";

@Component({
  selector: "app-rendezvous",
  standalone: true,
  templateUrl: "./RendezVous.component.html",
  imports: [
    CommonModule,
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BasicTableThreeComponent,
  ],
})
export class RendezVousComponent implements OnInit {
  rendezVous: RendezVousRow[] = [];
  loading = false;
  formatDate(date: string): string {
    const d = new Date(date);

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  formatTime(time: string): string {
    const d = new Date(time);

    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  constructor(
    private rdvService: RdvService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  mode: "list" | "view" | "edit" | "create" = "list";
  ngOnInit() {
    const routeMode = this.route.snapshot.data["mode"];

    if (routeMode) {
      this.mode = routeMode;
    }

    if (this.mode === "list") {
      this.loadRdvs();
    }
  }

  loadRdvs() {
    this.loading = true;

    this.rdvService.getAll().subscribe({
      next: (response: any) => {
        console.log("RDV API response:", response);

        const rdvs: RdvCreateDto[] = response?.member ?? [];

        this.rendezVous = rdvs.map((rdv) => ({
          id: String(rdv.id ?? 0),
          patient: `Patient ${rdv.id_patient}`,
          medecin: `Dr ${rdv.id_docteur}`,
          date: this.formatDate(rdv.date_rdv),
          heure: `${this.formatTime(rdv.heure_debut)}H - ${this.formatTime(rdv.heure_fin)}H`,
          statut: this.mapStatus(rdv.statut ?? "EN_ATTENTE"),
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  mapStatus(status: string): "Confirmé" | "En attente" | "Annulé" | "Terminé" {
    const s = (status || "").trim().toUpperCase();

    if (s === "CONFIRME") {
      return "Confirmé";
    }

    if (s === "ANNULE") {
      return "Annulé";
    }

    if (s === "TERMINE") {
      return "Terminé";
    }

    return "En attente";
  }

  viewRdv(rdv: any) {
    this.router.navigate(["/rendez-vous", rdv.id]);
  }

  editRdv(rdv: any) {
    this.router.navigate(["/rendez-vous", rdv.id, "edit"]);
  }

  deleteRdv(rdv: any) {
    if (!confirm("Supprimer ce rendez-vous ?")) return;

    this.rdvService.deleteById(rdv.id).subscribe({
      next: () => this.loadRdvs(),

      error: (err) => console.error(err),
    });
  }
}
