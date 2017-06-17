import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/map';

@Injectable()
export class WeatherService {
  constructor (private http: Http) {}

  getForecasts():  Observable<WeatherForecast[]>  {
  return this.http
          .get('/api/SampleData/WeatherForecasts')
          .map(response=>response.json()||{});
  }
}