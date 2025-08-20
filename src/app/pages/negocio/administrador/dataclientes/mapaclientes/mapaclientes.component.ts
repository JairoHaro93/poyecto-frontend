import { Component, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-mapaclientes',
  template: `
    <map-marker
      [position]="myCoordenada.coordenadas"
      [title]="myCoordenada.nombre"
      [options]="{ icon: myCoordenada.icon }"
    >
    </map-marker>
  `,
  standalone: true,
  imports: [MapMarker, MapInfoWindow, FormsModule],
  templateUrl: './mapaclientes.component.html',
  styleUrl: './mapaclientes.component.css',
})
export class MapaclientesComponent {
  @Input() myCoordenada!: any;
  myposition = signal<any>('');
  clientes: any[] = [];
  filtro: string = 'TODOS';

  ngOnInit() {
    //api de geolocalizacion de js nativa
    navigator.geolocation.getCurrentPosition((position) => {
      //BUSCA POSICION AUTOMATICA DEL NAVEGADOR
      /*   let center = new google.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );
      this.myposition.set(center);*/

      //MUESTRA UNA POSICION PREDETERMINADA
      const center = new google.maps.LatLng(-0.937173, -78.616045);
      this.myposition.set(center);
    });
  }
  getposition(coords: any) {
    let resultado: string = coords;
    let array: any[] = resultado.split(',');
    return new google.maps.LatLng(array[0], array[1]);
  }

  //metodo para abrir el infowindow
  openInfoWindow(marker: MapMarker, infowindow: MapInfoWindow) {
    infowindow.open(marker);
  }
}
