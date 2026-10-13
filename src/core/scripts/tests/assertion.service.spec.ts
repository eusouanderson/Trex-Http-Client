import { describe, expect, it } from 'vitest';
import { AssertionChain } from '../assertion.service';

describe('AssertionChain', () => {
  it('deve validar igualdade com equal e eql', () => {
    const chain = new AssertionChain(200);
    expect(() => chain.to.equal(200)).not.toThrow();
    expect(() => chain.to.eql(200)).not.toThrow();
    expect(() => chain.to.equal(500)).toThrow();
  });

  it('deve suportar modificador not', () => {
    const chain = new AssertionChain(200);
    expect(() => chain.to.not.equal(500)).not.toThrow();
    expect(() => chain.to.not.equal(200)).toThrow();
  });

  it('deve validar tipos com a e an', () => {
    expect(() => new AssertionChain('dinossauro').to.be.a('string')).not.toThrow();
    expect(() => new AssertionChain(123).to.be.a('number')).not.toThrow();
    expect(() => new AssertionChain(true).to.be.a('boolean')).not.toThrow();
    expect(() => new AssertionChain({}).to.be.an('object')).not.toThrow();
    expect(() => new AssertionChain([]).to.be.an('array')).not.toThrow();
    expect(() => new AssertionChain(123).to.be.a('string')).toThrow();
  });

  it('deve validar ok, true, false, null e undefined', () => {
    expect(() => new AssertionChain(1).to.be.ok).not.toThrow();
    expect(() => new AssertionChain(0).to.be.ok).toThrow();
    expect(() => new AssertionChain(true).to.be.true).not.toThrow();
    expect(() => new AssertionChain(false).to.be.false).not.toThrow();
    expect(() => new AssertionChain(null).to.be.null).not.toThrow();
    expect(() => new AssertionChain(undefined).to.be.undefined).not.toThrow();
  });

  it('deve validar empty para strings, arrays e objetos', () => {
    expect(() => new AssertionChain('').to.be.empty).not.toThrow();
    expect(() => new AssertionChain([]).to.be.empty).not.toThrow();
    expect(() => new AssertionChain({}).to.be.empty).not.toThrow();
    expect(() => new AssertionChain('rex').to.not.be.empty).not.toThrow();
    expect(() => new AssertionChain([1]).to.not.be.empty).not.toThrow();
    expect(() => new AssertionChain({ a: 1 }).to.not.be.empty).not.toThrow();
    expect(() => new AssertionChain('rex').to.be.empty).toThrow();
  });

  it('deve validar property em objetos com e sem valor esperado', () => {
    const obj = { id: 1, name: 'Trex' };
    expect(() => new AssertionChain(obj).to.have.property('id')).not.toThrow();
    expect(() => new AssertionChain(obj).to.have.property('name', 'Trex')).not.toThrow();
    expect(() => new AssertionChain(obj).to.have.property('name', 'Velociraptor')).toThrow();
    expect(() => new AssertionChain(obj).to.have.property('missing')).toThrow();
    expect(() => new AssertionChain(null).to.have.property('id')).toThrow();
  });

  it('deve validar lengthOf e include', () => {
    expect(() => new AssertionChain([1, 2, 3]).to.have.lengthOf(3)).not.toThrow();
    expect(() => new AssertionChain('dino').to.have.lengthOf(4)).not.toThrow();
    expect(() => new AssertionChain([1, 2]).to.have.lengthOf(5)).toThrow();
    expect(() => new AssertionChain(null).to.have.lengthOf(0)).toThrow();
    expect(() => new AssertionChain('dinossauro').to.include('saur')).not.toThrow();
    expect(() => new AssertionChain([1, 2, 3]).to.include(2)).not.toThrow();
    expect(() => new AssertionChain([1, 2, 3]).to.include(9)).toThrow();
  });

  it('deve validar empty com null e undefined e tipo null', () => {
    expect(() => new AssertionChain(null).to.be.empty).not.toThrow();
    expect(() => new AssertionChain(undefined).to.be.empty).not.toThrow();
    expect(() => new AssertionChain(null).to.be.a('null')).not.toThrow();
  });
});
