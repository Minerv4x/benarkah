const axios = require('axios');
const cheerio = require('cheerio');

class MainController {
  async home(req, res) {
    const { page } = req.params;
    const pagePath = !page || page === '1' ? '' : `page/${page}/`;
    const url = `https://samehadaku.click/${pagePath}`;
  
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      const obj = {
        season: $('.animposx')
          .map(function () {
            const link = $(this).find('a').attr('href');
            const slug = link.replace('https://samehadaku.click/', '').replace('/', '');
            const anime = slug.split('-episode')[0]; // Extract the anime name before "-episode"
            
            return {
              title: $(this).find('.data .title').text().trim(),
              status: $(this).find('.data .type').text(),
              link: link,
              anime: anime, // Using "anime" as the extracted name
              image: $(this).find('a .content-thumb img').attr('src').replace('quality=80', 'quality=100'),
              rating: $(this).find('a .content-thumb .score').text().trim(),
            };
          })
          .get(),
        latest: $('.post-show ul li')
          .map(function () {
            const link = $(this).find('.dtla .entry-title a').attr('href');
            const slug = link.replace('https://samehadaku.click/', '').replace('/', '');
            const anime = slug.split('-episode')[0]; // Extract the anime name before "-episode"
            
            return {
              title: $(this).find('.dtla .entry-title a').text(),
              episode: $(this).find('.dtla span:first-of-type').text(),
              postedBy: $(this).find('.dtla span:nth-of-type(2)').text(),
              release_time: $(this).find('.dtla span:last-of-type').text().replace(' Released on: ', ''),
              link: link,
              anime: anime, // Using "anime" as the extracted name
              slug: slug,
              image: $(this).find('.thumb a img').attr('src').replace('quality=80', 'quality=100'),
            };
          })
          .get(),
      };
  
      res.json(obj);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching data' });
    }
  }  

  async blog(req, res) {
    const { page } = req.params;
    const pagePath = !page || page === '1' ? '' : `page/${page}/`;
    const url = `https://samehadaku.click/blog/${pagePath}`;

    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const blogs = $('.box-blog')
        .map(function () {
          return {
            title: $(this).find('h2 a').text().trim(),
            sub: $(this).find('.exp p').text().trim(),
            date: $(this).find('.auth i').text().trim(),
            link: $(this).find('.img a').attr('href'),
            linkId: $(this).find('.img a').attr('href').replace('https://samehadaku.click/blog/', '').replace('/', '').trim(),
            image: $(this).find('.img a img').attr('src'),
          };
        })
        .get();

      res.json({ blog: blogs });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching blogs' });
    }
  }

  async readBlog(req, res) {
    const { id } = req.params;
    const url = `https://samehadaku.click/blog/${id}`;

    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const data = {
        title: $('.sttle h1.entry-title').text().trim(),
        author: $('.author.vcard span').text().trim(),
        date_created: $('span.date').text().trim(),
        image_cover: $('.thumb-blog img').attr('src'),
        content: $('.entry-content.content-post p')
          .map(function () {
            return { text: $(this).text(), img: $(this).find('img').attr('src') };
          })
          .get(),
        tags: $('.post_taxs a')
          .map(function () {
            return {
              title: $(this).text(),
              link: $(this).attr('href'),
              active: $(this).attr('class') !== 'posts_tags',
            };
          })
          .get(),
      };

      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching blog details' });
    }
  }

  async search(req, res) {
    const { title } = req.params;
    const url = `https://samehadaku.click/?s=${title}`;

    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);

      const results = $('.site-main .animpost')
        .map(function () {
          return {
            title: $(this).find('.animepost .stooltip .title h4').text(),
            score: $(this).find('.animepost .stooltip .skor').text().trim(),
            view: $(this).find('.animepost .stooltip .metadata span:last-of-type').text().replace(' Dilihat', ''),
            image: $(this).find('.animepost .animposx img').attr('src').replace('quality=80', 'quality=100'),
            sinopsis: $(this).find('.animepost .stooltip .ttls').text().trim(),
            genres: $(this).find('.animepost .stooltip .genres .mta a').map(function () { return $(this).text(); }).get(),
            status: $(this).find('.animepost .animposx a .data .type').text().trim(),
            link: $(this).find('.animepost .animposx a').attr('href'),
            linkId: $(this).find('.animepost .animposx a').attr('href').replace('https://samehadaku.click/anime/', '').replace('/', ''),
          };
        })
        .get();

      res.json({ results });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching search results' });
    }
  }
  async tag(req, res) {
    const { tag } = req.params;
    const url = `https://samehadaku.click/tag/${tag}`;
  
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      const data = {
        tag: $('h1.page-title').text().replace('Tag: ', '').trim(),
        results: $('.site-main .animpost')
          .map(function () {
            const link = $(this).find('.animepost .animposx a').attr('href');
            return {
              title: $(this).find('.animepost .stooltip .title h4').text().trim(),
              view: $(this).find('.animepost .stooltip .metadata span:last-of-type').text().replace(' Dilihat', '').trim(),
              image: $(this).find('.animepost .animposx img').attr('src').replace('quality=80', 'quality=100'),
              sinopsis: $(this).find('.animepost .stooltip .ttls').text().trim(),
              status: $(this).find('.animepost .animposx a .data .type').text().trim(),
              link: link,
              linkId: link.replace('https://samehadaku.click/anime/', '').replace('/', ''),
            };
          })
          .get(),
      };
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching tag data' });
    }
  }
  async blogCategoryByPage(req, res) {
    const { category, page } = req.params;
    const url = `https://samehadaku.click/blog-category/${category}/page/${page}/`;
  
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      const data = {
        category: $('h1.page-title').text().replace('Blog Category: ', '').trim(),
        results: $('.box-blog')
          .map(function () {
            const link = $(this).find('.img a').attr('href');
            return {
              title: $(this).find('h2 a').text().trim(),
              sub: $(this).find('.exp p').text().trim(),
              date: $(this).find('.auth i').text().trim(),
              link: link,
              linkId: link.replace('https://samehadaku.click/blog/', '').replace('/', '').trim(),
              image: $(this).find('.img a img').attr('src'),
            };
          })
          .get(),
      };
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching blog category data' });
    }
  }
  async season(req, res) {
    const url = `https://samehadaku.click/season/spring-2020/`;
  
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      const data = {
        title: $('.widget-title h1.page-title').text().trim(),
        results: $('.relat .animpost')
          .map(function () {
            const link = $(this).find('.animepost .animposx a').attr('href');
            return {
              title: $(this).find('.animepost .stooltip .title h4').text().trim(),
              score: $(this).find('.animepost .stooltip .skor').text().trim(),
              view: $(this).find('.animepost .stooltip .metadata span:last-of-type').text().replace(' Dilihat', '').trim(),
              image: $(this).find('.animepost .animposx img').attr('src').replace('quality=80', 'quality=100'),
              sinopsis: $(this).find('.animepost .stooltip .ttls').text().trim(),
              genres: $(this).find('.animepost .stooltip .genres .mta a').map(function () { return $(this).text(); }).get(),
              status: $(this).find('.animepost .animposx a .data .type').text().trim(),
              link: link,
              linkId: link.replace('https://samehadaku.click/anime/', '').replace('/', ''),
            };
          })
          .get(),
      };
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching seasonal anime data' });
    }
  }
  async listWithPage(req, res) {
    const { page } = req.params;
    const url = `https://samehadaku.click/daftar-anime/page/${page}/`;
  //ss
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      const data = {
        title: 'Daftar Anime',
        results: $('.site-main .animpost')
          .map(function () {
            const link = $(this).find('.animepost .animposx a').attr('href');
            return {
              title: $(this).find('.animepost .stooltip .title h4').text().trim(),
              score: $(this).find('.animepost .stooltip .skor').text().trim(),
              view: $(this).find('.animepost .stooltip .metadata span:last-of-type').text().replace(' Dilihat', '').trim(),
              image: $(this).find('.animepost .animposx img').attr('src').replace('quality=80', 'quality=100'),
              sinopsis: $(this).find('.animepost .stooltip .ttls').text().trim(),
              genres: $(this).find('.animepost .stooltip .genres .mta a').map(function () { return $(this).text(); }).get(),
              status: $(this).find('.animepost .animposx a .data .type').text().trim(),
              link: link,
              linkId: link.replace('https://samehadaku.click/anime/', '').replace('/', ''),
            };
          })
          .get(),
      };
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching anime list with pagination' });
    }
  }

  async anime({ params: { id } }, req) {
    const page = `https://samehadaku.click/anime/${id}/`;
  
    try {
      // Fetch the page using axios
      const { data: pageData } = await axios.get(page);
      const $ = cheerio.load(pageData);
  
      const data = {};
  
      data.title = $('.infox h1').text();
      data.sinopsis = $('.entry-content.entry-content-single p').text();
      data.image = $('.thumb img').attr('src').replace('quality=80', 'quality=100');
      data.genre = $('.genre-info a')
        .map(function () {
          return {
            text: $(this).text(),
            link: $(this).attr('href'),
          };
        })
        .get();
  
      data.ratingValue = $('[itemprop=ratingValue]').text();
      data.ratingCount = $('[itemprop=ratingCount]').text();
  
      data.detail = {};
      let tmp;
  
      // Helper function to process the span elements
      const extractDetail = (index) => {
        tmp = $(`.spe span:nth-of-type(${index})`)
          .map(function () {
            let text = $(this).text().split(' ');
            const first = text[0] === 'Total' ? (text[0] + text[1]).replace(' ', '') : text[0];
  
            if (text[0] === 'Total') {
              text.shift();
              text.shift();
            } else {
              text.shift();
            }
  
            text = text.join(' ');
            return [first, text];
          })
          .get();
        data.detail[tmp[0]] = tmp[1];
      };
  
      // Process the details
      for (let i = 1; i <= 12; i++) {
        extractDetail(i);
      }
  
      // Get YouTube link if available
      data.youtube = $('iframe')
        .map(function () {
          return {
            link: $(this).attr('src'),
            id: $(this).attr('src').replace('https://www.youtube.com/embed/', '').trim(),
          };
        })
        .get()[0];
  
      // Get episodes list
      data.list_episode = $('.lstepsiode.listeps ul li')
        .map(function () {
          return {
            episode: $(this).find('.epsright .eps a').text(),
            title: $(this).find('.epsleft .lchx a').text(),
            date_uploaded: $(this).find('.epsleft .date').text(),
            link: $(this).find('.epsright .eps a').attr('href'),
            id: $(this)
              .find('.epsright .eps a')
              .attr('href')
              .replace('https://samehadaku.click/', ''),
          };
        })
        .get();
  
      // Fetch details of the last episode
      const lastEpisodeLink = data.list_episode[data.list_episode.length - 1].link;
      const { data: lastEpisodeData } = await axios.get(lastEpisodeLink);
      const $$ = cheerio.load(lastEpisodeData);
  
      // Get recommended anime
      data.recommend = await Promise.all(
        $$('.animposx')
          .map(async function () {
            const recommendation = {
              link: $(this).find('a').attr('href'),
              image: $(this).find('a img').attr('src').replace('quality=80', 'quality=100'),
              title: $(this).find('a img').attr('title'),
            };
  
            const { data: recommendationData } = await axios.get(recommendation.link);
            const $$$ = cheerio.load(recommendationData);
  
            recommendation.genre = $$$('.genre-info a')
              .map(function () {
                return $(this).text();
              })
              .get();
  
            return recommendation;
          })
          .get()
      );
  
      // Fetch latest anime data
      const { data: latestData } = await axios.get('https://samehadaku.click/');
      const $$$$ = cheerio.load(latestData);
  
      data.latest = await Promise.all(
        $$$$('.post-show ul li')
          .slice(0, 5)
          .map(async function () {
            const latest = {
              title: $(this).find('.dtla .entry-title a').text(),
              episode: $(this).find('.dtla span:first-of-type author').text(),
              postedBy: $(this).find('.dtla span:nth-of-type(2) author').text(),
              release_time: $(this)
                .find('.dtla span:last-of-type')
                .text()
                .replace(' Released on: ', ''),
              link: $(this).find('.dtla .entry-title a').attr('href'),
              image: $(this).find('.thumb a img').attr('src').split('?')[0],
            };
  
            const { data: latestAnimeData } = await axios.get(latest.link);
            const $$$$$ = cheerio.load(latestAnimeData);
  
            latest.genre = $$$$$('.genre-info a')
              .map(function () {
                return $(this).text();
              })
              .get();
  
            return latest;
          })
          .get()
      );
  
      req.send(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      req.status(500).send('Error fetching data');
    }
  }
  ////kontol
  async readanime(req, res) {
    let { link } = req.params;
  
    // Ensure the link starts with the correct base URL
    if (link.startsWith('https://samehadaku.click')) {
      link = link.replace('https://samehadaku.click', '');
    }
  
    // Ensure the link is properly formatted with a leading '/'
    if (!link.startsWith('/')) {
      link = '/' + link;
    }
  
    const url = `https://samehadaku.click${link}`;
    console.log(`Fetching data from: ${url}`);  // Log the URL being fetched
  
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      // Safely extract the data and provide fallback values if necessary
      const data = {
        title: $('h1.entry-title').text()?.trim() || "Unknown Title",
        eps: $('span[itemprop=episodeNumber]').text().trim() || "Unknown Episode",
        uploader: $('span.year')
          .text()
          .replace('Diposting oleh ', '')
          .split(' - ')[0]
          ?.trim() || "Unknown Uploader",
        date_uploaded: $('span.year')
          .text()
          .replace('Diposting oleh ', '')
          .split(' - ')[1]
          ?.trim() || "Unknown Date",
        time_post: $('.time-post').text().trim() || "Unknown Time",
        detail_anime: {
          title: $('.infoanime .infox h2.entry-title').text()?.trim() || "Unknown Anime Title",
          image: $('.infoanime .thumb img').attr('src') ? $('.infoanime .thumb img').attr('src').replace('quality=80', 'quality=100') : null,
          sinopsis: $('.infoanime .infox .desc div').text()?.trim() || "No Synopsis Available",
          genres: $('.infoanime .infox .genre-info a').map(function () {
            return $(this).text()?.trim() || "Unknown Genre";
          }).get(),
        },
        downloadEps: $('.download-eps')
          .map(function () {
            return {
              format: $(this).find('p').text()?.trim() || "Unknown Format",
              data: $(this)
                .find('ul li')
                .map(function () {
                  return {
                    quality: $(this).find('strong').text()?.trim() || "Unknown Quality",
                    link: {
                      zippyshare: $(this).find('span:nth-of-type(1) a').attr('href') || "#",
                      gdrive: $(this).find('span:nth-of-type(2) a').attr('href') || "#",
                      reupload: $(this).find('span:nth-of-type(3) a').attr('href') || "#",
                    },
                  };
                })
                .get(),
            };
          })
          .get(),
        recommend: $('.animposx')
          .map(function () {
            const link = $(this).find('a').attr('href');
            return {
              link: link,
              image: $(this).find('a img').attr('src') ? $(this).find('a img').attr('src').replace('quality=80', 'quality=100') : null,
              title: $(this).find('a img').attr('title') || "Unknown Recommendation",
            };
          })
          .get(),
      };
  
      console.log('Data extracted:', data);  // Log the extracted data
      res.json(data);  // Send response only once
    } catch (error) {
      console.error("Error fetching anime details:", error.message);
      console.error("Full error details:", error);  // Log the full error for debugging
  
      if (! res.headersSent) {  // Ensure response is sent only once
        res.status(500).json({ error: 'Error fetching anime details', details: error.message });
      }
    }
  } 
  
  // try {
  //   const response = await axios.get(url);
  //   if (response.status !== 200) {
  //     throw new Error(`Failed to fetch page: ${response.status}`);
  //   }
  
  //   const html = response.data;
  //   const $ = cheerio.load(html);
  
  //   // Continue your scraping process
  // } catch (error) {
  //   console.error("Error fetching anime details:", error.message);
  //   res.status(500).json({ error: 'Error fetching anime details', details: error.message });
  // }
  
  async searchByGenre(req, res) {
    const { genre } = req.params;
    const url = `https://samehadaku.click/genre/${genre}/`; // Ensure the URL is correct
    
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
    
      // Extract the genre name
      const genreName = $('h1.page-title').text().replace('Genre: ', '').trim();
    
      // Extract the anime data
      const results = $('.site-main .animpost').map(function () {
        const link = $(this).find('.animepost .animposx a').attr('href');
        
        // Check if link exists, if not return null
        if (!link) return null;
  
        return {
          title: $(this).find('.animepost .stooltip .title h4').text().trim() || "Unknown Title",
          score: $(this).find('.animepost .stooltip .skor').text().trim() || "No Score",
          view: $(this).find('.animepost .stooltip .metadata span:last-of-type').text().replace(' Dilihat', '').trim() || "No Views",
          image: $(this).find('.animepost .animposx img').attr('src') ? $(this).find('.animepost .animposx img').attr('src').replace('quality=80', 'quality=100') : null,
          sinopsis: $(this).find('.animepost .stooltip .ttls').text().trim() || "No Synopsis Available",
          genres: $(this).find('.animepost .stooltip .genres .mta a').map(function () {
            return $(this).text();
          }).get(),
          status: $(this).find('.animepost .animposx a .data .type').text().trim() || "Unknown Status",
          link: link,
          linkId: link.replace('https://samehadaku.click/anime/', '').replace('/', '')
        };
      }).get();
    
      // Remove any null values (where the link was missing)
      const filteredResults = results.filter(result => result !== null);
  
      const data = {
        genre: genreName || "Unknown Genre",
        results: filteredResults.length > 0 ? filteredResults : []
      };
    
      res.json(data);
    } catch (error) {
      console.error("Error fetching genre data:", error); // Log the error for debugging
      res.status(500).json({ error: 'Error fetching genre data' });
    }
  }
  async daftarGenre(req, res) {
    const url = `https://samehadaku.click/`;
  
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      const data = {
        daftar_genre: $('.genre > li')
          .map(function () {
            const span = $(this).find('span').text();
            const link = $(this).find('a').attr('href');
            return {
              nama_genre: $(this).text().replace(span, '').trim(),
              link: link,
              linkId: link.replace('https://samehadaku.click/genre/', '').replace('/', ''),
              total: span,
            };
          })
          .get(),
      };
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching genres' });
    }
  }
  async date(req, res) {
    const url = `https://samehadaku.click/jadwal-rilis/`;
  
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      const days = $('.schedule .tab-dates').map(function () {
        return $(this).text().trim();
      }).get();
  
      const results = $('.schedule .result-schedule').map(function (index) {
        return {
          day: days[index],
          list: $(this)
            .find('.animepost')
            .map(function () {
              const link = $(this).find('.animposx a').attr('href');
              return {
                title: $(this).find('.animposx a .data .title').text().trim(),
                image: $(this).find('.animposx a .content-thumb img').attr('src').replace('quality=80', 'quality=100'),
                score: $(this).find('.animposx a .content-thumb .score').text().trim(),
                genres: $(this).find('.animposx a .data .type').text().trim().split(', '),
                link: link,
                linkId: link.replace('https://samehadaku.click/anime/', '').replace('/', ''),
              };
            })
            .get(),
        };
      }).get();
  
      res.json({ title: 'Jadwal Rilis', results });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching release schedule' });
    }
  }
  async listWithoutPage(req, res) {
    const url = `https://samehadaku.click/daftar-anime/`;
  
    try {
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
  
      const data = {
        title: 'Daftar Anime',
        results: $('.site-main .animpost')
          .map(function () {
            const link = $(this).find('.animepost .animposx a').attr('href');
            return {
              title: $(this).find('.animepost .stooltip .title h4').text().trim(),
              score: $(this).find('.animepost .stooltip .skor').text().trim(),
              view: $(this).find('.animepost .stooltip .metadata span:last-of-type').text().replace(' Dilihat', '').trim(),
              image: $(this).find('.animepost .animposx img').attr('src').replace('quality=80', 'quality=100'),
              sinopsis: $(this).find('.animepost .stooltip .ttls').text().trim(),
              genres: $(this).find('.animepost .stooltip .genres .mta a').map(function () { return $(this).text(); }).get(),
              status: $(this).find('.animepost .animposx a .data .type').text().trim(),
              link: link,
              linkId: link.replace('https://samehadaku.click/anime/', '').replace('/', ''),
            };
          })
          .get(),
      };
  
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching anime list' });
    }
  }
                  
}

module.exports = new MainController();
