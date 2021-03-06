import Post from './interface/post.interface';
import Testimonial from './interface/testimonial.interface';

import * as Cheerio from 'cheerio';
import Mustache from 'mustache';
import { tns } from 'tiny-slider/src/tiny-slider';

const html = async () => {
  const res: any  = await fetch('https://cors-anywhere.herokuapp.com/https://www.facebook.com/pg/equusfirst/posts/');
  const html: any = await res.text();

  return Cheerio.load(html, {
    withDomLvl1: true,
    normalizeWhitespace: true,
    xmlMode: true,
    decodeEntities: true
  });
}

export default class EquusFirstScrapper {
  posts: Post[] = [];
  testimonials: Testimonial[] = [];

  feed: any[] = [];

  parser: DOMParser = new DOMParser();

  constructor() {
    this.testimonials = [
      {
        source: 'facebook',
        type: 'testimonial',
        author: 'Rachel Harper',
        date: 'June 26th, 2016',
        message: `
          <p>Super proud of Mrs B getting a 5th in her dressage test, and Mr T winning his jumping class :) they both did so well :)</p>
          <p>Thank you so much Emma Green for all your help!</p>
        `
      },

      {
        source: 'facebook',
        type: 'testimonial',
        author: 'Nicola Wainwright',
        date: 'July 8th, 2015',
        message: `
          <p>Wow Murphy was in top form tonight :) didn't want to trot tonight so as fast pace when he did but he was determined get me cantering :)</p>
          <p>so happy :) finally getting my confidence back with the help and patience of wonderful Emma Green :) thank you so much hun :) xx</p>
        `
      },

      {
        source: 'facebook',
        type: 'testimonial',
        author: 'Jo Latham',
        date: 'September 8th, 2014',
        message: `
          <p>Today I and my 17.3 5yr old shire mare had a lesson from Emma and I have to say I am over the moon and re motivated.</p>
          <p>Emma and I have been co-workers in the past and friends for a number of years so I thought this may have affected the way she approached teaching me and of course the way I took things on board. But I am very pleased to say that once in side the arena we both managed to leave our personal friendship behind the closed gate. </p>
          <p>Emma was very professional and explained everything in a scientific but very easy way to understand and I feel that bess and I achieved a great deal in the hour! I will definitely be making this a regular occurrence from now on.</p>
          <p>Thank you Emma!!!</p>
        `
      }
    ]

    this.get();
  }

  async get() {
    const $ = await html();

    $('._1xnd').children().each((index: number, element: any) => {
      const wrapper: any      = $(element).find('.userContentWrapper');
      const postMessage: any  = $(wrapper).find('[data-testid=post_message]');
      const images: any       = $(wrapper).find('.uiScaledImageContainer');

      const post: Post = {
        source:   'facebook',
        type:     'feed',
        message:  $(postMessage).text(),
        likes:    0
      }

      try {
        images.each((index: number, element: any) => {
          post['images'].push({
            id: '',
            url: element.parent.attribs['data-ploi']
          })
        });
      } catch(e) { }

      this.posts.push(post);
    });

    this.buildFeed();
    this.show();
  }

  private buildFeed() {
    this.feed.push(...this.testimonials);
    this.feed.push(...this.posts);
  }

  private show() {
    this.feed.forEach((post: any) => {
      const template: any = document.querySelector(`#${ post.type }Template`).innerHTML;
      const content: any  = document.querySelector('#feedContent');

      Mustache.parse(template);

      const page: any = this.parser
        .parseFromString(
          Mustache.render(template, post),
          'text/html'
        );

      content.appendChild(page.body.children[0]);
    });

    this.createCarousel();
  }

  private createCarousel() {
    const slider: any = tns({
      mode: 'carousel',
      controls: false,
      items: 1,
      edgePadding: 0,
      speed: 2500,
      gutter: 32,
      slideBy: 'page',
      autoplay: true,
      rewind: true,
      autoHeight: true
    });

    document.querySelector('.slider-controls > .prev').addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      slider.goTo('prev');
    });

    document.querySelector('.slider-controls > .next').addEventListener('click', (event: MouseEvent) => {
      event.preventDefault();
      slider.goTo('next');
    });
  }
}