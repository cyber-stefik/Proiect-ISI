/*
  Copyright 2019 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    Input,
    Output,
    EventEmitter,
    OnDestroy
} from "@angular/core";

import esri = __esri; // Esri TypeScript Types


import Config from '@arcgis/core/config';
import WebMap from '@arcgis/core/WebMap';
import MapView from '@arcgis/core/views/MapView';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Expand from '@arcgis/core/widgets/Expand';

import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from '@arcgis/core/Graphic';


import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import FeatureSet from '@arcgis/core/rest/support/FeatureSet';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import * as route from "@arcgis/core/rest/route.js";

import * as locator from "@arcgis/core/rest/locator.js";
import Track from "@arcgis/core/widgets/Track";
import Locate from "@arcgis/core/widgets/Locate";

import {Observable, Subscription} from "rxjs";
import { FirebaseService,
  Location } from "src/app/services/database/firebase";
import Point from '@arcgis/core/geometry/Point';
import {exitCodeFromResult} from "@angular/compiler-cli";


@Component({
    selector: "app-esri-map",
    templateUrl: "./esri-map.component.html",
    styleUrls: ["./esri-map.component.scss"]
})
export class EsriMapComponent implements OnInit, OnDestroy {
    @Output() mapLoadedEvent = new EventEmitter<boolean>();

    // The <div> where we will place the map
    @ViewChild("mapViewNode", { static: true }) private mapViewEl: ElementRef;

    // Instances
    map: esri.Map;
    view: esri.MapView;
    pointGraphic: esri.Graphic;
    graphicsLayer: esri.GraphicsLayer;
    private routeUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";


    // Attributes
    zoom = 10;
    center: Array<number> = [-118.73682450024377, 34.07817583063242];
    basemap = "streets-vector";
    loaded = false;
    pointCoords: number[] = [-118.73682450024377, 34.07817583063242];
    dir: number = 0;
    count: number = 0;
    timeoutHandler = null;


    // firebase sync
    isConnected: boolean = false;
    subscriptionList: Subscription;
    subscriptionObj: Subscription;

    constructor(
      private fbs: FirebaseService
      //private fbs: FirebaseMockService
    ) { }

    //constructor() { }

    clearRouteAndGraphics() {
        if (this.view) {
            this.view.graphics.removeAll(); // Remove route graphics

            // Remove directions UI
            const directionsPanel = document.querySelector('.esri-directions__scroller');
            if (directionsPanel) {
                directionsPanel.remove();
            }
        }
    }

    centerMap(location: number[]) {
        if (this.view) {
            this.view.goTo({
                center: location,
                zoom: 15 // Adjust the zoom level as needed
            });
        }
    }

    async initializeMap() {
        try {
            // Configure the Map
            const mapProperties: esri.WebMapProperties = {
                basemap: this.basemap
            };

            Config.apiKey = "AAPK92446b830c7b4d8eaade779011d11193ZiRqrgT8ysmXzMMG76BiXxIwCon7RUr7JLJRGf3k0Q9ACr8dRE7uu_9QOeUit1bS";

            this.map = new WebMap(mapProperties);

            // Use the WebMap properties to set the center and zoom level for Bucharest
            const mapViewProperties = {
                container: this.mapViewEl.nativeElement,
                center: [26.1025, 44.4268], // Bucharest coordinates
                zoom: 12, // Adjust the zoom level as needed
                map: this.map
            };

            this.addFeatureLayers();
            this.view = new MapView(mapViewProperties);

            // Fires `pointer-move` event when user clicks on "Shift"
            // key and moves the pointer on the view.
            this.view.on('pointer-move', ["Shift"], (event) => {
                let point = this.view.toMap({ x: event.x, y: event.y });
                console.log("map moved: ", point.longitude, point.latitude);
            });

            await this.view.when(); // wait for map to load

            console.log("ArcGIS map loaded");
            // this.addRouter();
            console.log(this.view.center);

            const locate = new Locate({
                view: this.view,
                graphic: new Graphic({
                    symbol: {
                        type: "simple-marker",
                        size: "12px",
                        color: "green",
                        outline: {
                            color: "#efefef",
                            width: "1.5px"
                        }
                    } as any  // Use 'as any' to handle the type issue
                }),
                useHeadingEnabled: false
            });
            this.view.ui.add(locate, "top-left");
            this.fbs.connectToDatabase();
            this.fbs.getData().subscribe((items: Location[]) =>{
                console.log("got new items from list: ", items);
                //this.graphicsLayer.removeAll();
                for (let item of items) {
                    this.addTrailhead(item);
                }
            });

            return this.view;
        } catch (error) {
            console.log("EsriLoader: ", error);
        }
    }

    findPlaces(category: string, pt: number[]) {
        const geocodingServiceUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";
        console.log("findPlaces: point clicked: ", pt[0], pt[1]);
        const params = {
            categories: category,
            location: pt,  // Paris (2.34602,48.85880)
            outFields: ["PlaceName","Place_addr"]
        } as any

        locator.addressToLocations(geocodingServiceUrl, params).then((results)=> {
            this.showResults(results);
        });

    }

  addTrailhead(location: Location) {
        const point = new Point({
          longitude: location.coordinates[0].longitude,
          latitude: location.coordinates[0].latitude
        });

        const trailheadGraphic = new Graphic({
          geometry: point,
          symbol:  {
            type: "picture-marker",
            size: "12px",
            url: "https://static.arcgis.com/icons/places/Swimming_Pool_15.svg",
            width: "18px",
            height: "18px"
          } as any,
          attributes: {
            Name: location.id // You can customize this based on your trailhead data structure
          },
          popupTemplate: {
            title: location.id,
            content: "Trailhead located at Lat: {latitude}, Lon: {longitude}"
          }
        });
        this.view.graphics.add(trailheadGraphic);
        //this.graphicsLayer.add(trailheadGraphic);
  }

    showResults(results: any[]) {
        this.view.popup.close();
        this.view.graphics.removeAll();
        console.log("esri-map.component - showResults: " + results.toString());
        results.forEach((result)=>{
            this.view.graphics.add(
                new Graphic({
                    attributes: result.attributes,
                    geometry: result.location,
                    symbol: {
                        type: "simple-marker",
                        color: "yellow",
                        size: "30px",
                        outline: {
                            color: "#ffffff",
                            width: "10px"
                        }
                    }as any,
                    popupTemplate: {
                        title: "{PlaceName}",
                        content: "{Place_addr}" + "PULICICA" + "<br><br>" + result.location.x.toFixed(5) + "," + result.location.y.toFixed(5)
                    }
                }));
        });
        if (results.length) {
            const g = this.view.graphics.getItemAt(0);
            this.view.openPopup({
                features: [g],
                location: g.geometry
            });
        }
    }





    addFeatureLayers() {
        // Trailheads feature layer (points)
        var trailheadsLayer: esri.FeatureLayer = new FeatureLayer({
            url:
                "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0"
        });

        this.map.add(trailheadsLayer);

        // Trails feature layer (lines)
        var trailsLayer: esri.FeatureLayer = new FeatureLayer({
            url:
                "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0"
        });

        this.map.add(trailsLayer, 0);

        // Parks and open spaces (polygons)
        var parksLayer: esri.FeatureLayer = new FeatureLayer({
            url:
                "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0"
        });

        this.map.add(parksLayer, 0);

        console.log("feature layers added");
    }

    addRouter() {
        this.view.on("click", (event) => {
            console.log("point clicked: ", event.mapPoint.latitude, event.mapPoint.longitude);
            if (this.view.graphics.length === 0) {
                this.addGraphic("origin", event.mapPoint);
            } else if (this.view.graphics.length === 1) {
                this.addGraphic("destination", event.mapPoint);
                this.getRoute(); // Call the route service
            } else {
                this.clearRouteAndGraphics(); // Clear route and graphics
                this.addGraphic("origin", event.mapPoint);
            }
        });
    }


    addGraphic(type: any, point: any) {
    const graphic = new Graphic({
      symbol: {
        type: "simple-marker",
        color: (type === "origin") ? "white" : "black",
        size: "8px"
      } as any,
      geometry: point
    });
    this.view.graphics.add(graphic);
  }

    getRoute() {
        const routeParams = new RouteParameters({
            stops: new FeatureSet({
                features: this.view.graphics.toArray()
            }),
            returnDirections: true
        });

        route.solve(this.routeUrl, routeParams).then((data: any) => {
            for (let result of data.routeResults) {
                result.route.symbol = {
                    type: "simple-line",
                    color: [5, 150, 255],
                    width: 3
                };
                this.view.graphics.add(result.route);
            }

            // Display directions
            if (data.routeResults.length > 0) {
                const directions: any = document.createElement("ol");
                directions.classList = "esri-widget esri-widget--panel esri-directions__scroller";
                directions.style.marginTop = "0";
                directions.style.padding = "15px 15px 15px 30px";
                const features = data.routeResults[0].directions.features;

                let sum = 0;
                // Show each direction
                features.forEach((result: any, i: any) => {
                    sum += parseFloat(result.attributes.length);
                    const direction = document.createElement("li");
                    direction.innerHTML = result.attributes.text + " (" + result.attributes.length + " miles)";
                    directions.appendChild(direction);
                });

                sum = sum * 1.609344;
                console.log('dist (km) = ', sum);
                this.view.ui.empty("top-right");
                this.view.ui.add(directions, "top-right");
            }
        }).catch((error: any) => {
            console.log(error);
        });
    }

    runTimer() {
        this.timeoutHandler = setTimeout(() => {
            // code to execute continuously until the view is closed
            // ...
            this.runTimer();
        }, 200);
    }

    stopTimer() {
        if (this.timeoutHandler != null) {
            clearTimeout(this.timeoutHandler);
            this.timeoutHandler = null;
        }

    }

    ngOnInit() {
        // Initialize MapView and return an instance of MapView
        this.initializeMap().then(() => {
            // The map has been initialized
            console.log("mapView ready: ", this.view.ready);
            this.loaded = this.view.ready;
            this.mapLoadedEvent.emit(true);

            this.addRouter(); // Add this line to initialize routing
            this.runTimer();
        });
    }

    ngOnDestroy() {
        if (this.view) {
            // destroy the map view
            this.view.container = null;
        }
        this.stopTimer();
    }
}
