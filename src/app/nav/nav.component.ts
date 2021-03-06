import { Component, OnInit, HostListener } from '@angular/core';
import { CountryService } from '../services/country.service';
import { Country } from '../model/country';
import { TopicService } from '../services/topic.service';
import { BehaviorSubject } from 'rxjs';
import { ConfigProvider } from '../providers/configProvider';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {
  selectedCountry: BehaviorSubject<Country>;
  topics: Array<any>;
  feedbackUrl: string;

  constructor(private countryService: CountryService, private topicService: TopicService) { }

  ngOnInit() {
    this.feedbackUrl = ConfigProvider.settings.feedbackUrl + '?source=' + window.location.href;
    this.selectedCountry = this.countryService.selectedCountry;
    this.topics = this.topicService.getTopics();
  }
}
