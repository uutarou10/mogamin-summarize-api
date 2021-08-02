import express from 'express';
import Parser from 'rss-parser';
import cors from 'cors';

export const app = express();

app.use(cors());

interface Article {
  url: string;
  title: string;
  body: string;
  created_at: string;
  media: string;
}

const feedUrls = {
  note: 'https://note.com/mogamin3/rss',
  blog: 'https://yurufuwa-tech.hatenablog.com/rss',
  zenn: 'https://zenn.dev/mogamin/feed',
  qiita: 'https://qiita.com/mogamin3/feed'
};

const articleFromParserItem: (mediaType: string, item: Parser.Item) => Article = (mediaType, item) => ({
  url: item.link!,
  title: item.title!,
  body: item.contentSnippet!,
  created_at: item.isoDate!,
  media: mediaType
});

app.get('/articles', async (req, res) => {
  const parser = new Parser();

  // const results = (await Promise.all(Object.entries(feedUrls).map(([media, url]) => (
  //   parser.parseURL(url).then(output => output.items).then(items => ({[media]: items}))
  // )))).reduce((prev, current) => {return {...prev, ...current}}, {} as {[media: string]: Parser.Item[]});

  const results = (await Promise.all(Object.entries(feedUrls).map(([media, url]) => {
    return parser.parseURL(url).then(({items}) => items.map(item => articleFromParserItem(media, item)))
  }))).reduce((prev, current) => [...prev, ...current], []);

  res.send(results);
});
