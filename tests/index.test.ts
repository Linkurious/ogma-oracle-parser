import { describe, it, expect } from 'vitest';
import { getLob } from './LobStub';
import { OgmaOracleParser, SQLID, parseLob } from '../src';
describe('parse', () => {

  it('Should parse a Lob into a rawGraph', async () => {
    const lob = await getLob('tests/fixtures/tiny-graph.json');
    const { nodes, edges } = await parseLob(lob);
    const nodeids = ['AIRPORTS:3', 'AIRPORTS:5', 'AIRPORTS:4',];
    const nodedata = [
      { 'AIRPORT_TYPE': 'airport' },
      { 'AIRPORT_TYPE': 'airport' },
      { 'AIRPORT_TYPE': 'airport' },
    ];
    const edgeids = [
      'ROUTES:21350',
      'ROUTES:49987',
      'ROUTES:21363',
      'ROUTES:21523',
    ];
    const sources = [
      'AIRPORTS:3',
      'AIRPORTS:5',
      'AIRPORTS:4',
      'AIRPORTS:5',
    ];
    const targets = [
      'AIRPORTS:1',
      'AIRPORTS:1',
      'AIRPORTS:1',
      'AIRPORTS:1',
    ];
    const edgeData = [
      { 'AIRLINE_ID': 1308 },
      { 'AIRLINE_ID': 328 },
      { 'AIRLINE_ID': 1308 },
      { 'AIRLINE_ID': 1308 },
    ];
    expect(nodes.map(n => n.id)).deep.equal(nodeids);
    expect(nodes.map(n => n.data)).deep.equal(nodedata);
    expect(edges.map(e => e.id)).deep.equal(edgeids);
    expect(edges.map(e => e.source)).deep.equal(sources);
    expect(edges.map(e => e.target)).deep.equal(targets);
    expect(edges.map(e => e.data)).deep.equal(edgeData);
  });

  it('should respect idFunction', async () => {
    const lob = await getLob('tests/fixtures/tiny-graph.json');
    const SQLIDtoId = (sqlid: SQLID) => {
      const match = sqlid.match(/(.*)\{.+:([0-9]+)/);
      if (!match) throw new Error(`Could not parse ${sqlid}`);
      return `--${match[1]}--${match[2]}--`;
    };
    const parser = new OgmaOracleParser({
      SQLIDtoId,
    });
    const { nodes, edges } = await parser.parseLob(lob);
    const nodeids = ['--AIRPORTS--3--', '--AIRPORTS--5--', '--AIRPORTS--4--',];
    const edgeids = [
      '--ROUTES--21350--',
      '--ROUTES--49987--',
      '--ROUTES--21363--',
      '--ROUTES--21523--',
    ];
    const sources = [
      '--AIRPORTS--3--',
      '--AIRPORTS--5--',
      '--AIRPORTS--4--',
      '--AIRPORTS--5--',
    ];
    const targets = [
      '--AIRPORTS--1--',
      '--AIRPORTS--1--',
      '--AIRPORTS--1--',
      '--AIRPORTS--1--',
    ];
    expect(nodes.map(n => n.id)).deep.equal(nodeids);
    expect(edges.map(e => e.id)).deep.equal(edgeids);
    expect(edges.map(e => e.source)).deep.equal(sources);
    expect(edges.map(e => e.target)).deep.equal(targets);
  });
});