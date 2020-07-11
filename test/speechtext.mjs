import assert from 'assert';

import speechText from '../src/speechtext.mjs';

describe('speechText', () => {
  it("should return 'midnight' at 00:00", () => {
    const date = new Date('2020-01-01T00:00:00');
    assert.equal(speechText('en', false, date), 'midnight');
  });

  it("should return '00:01' at 00:01", () => {
    const date = new Date('2020-01-01T00:01:00');
    assert.equal(speechText('en', false, date), '00:01');
  });

  it("should return '00:10' at 00:10", () => {
    const date = new Date('2020-01-01T00:10:00');
    assert.equal(speechText('en', false, date), '00:10');
  });

  it("should return 'quarter past midnight' at 00:15", () => {
    const date = new Date('2020-01-01T00:15:00');
    assert.equal(speechText('en', false, date), 'quarter past midnight');
  });

  it("should return 'half past midnight' at 00:30", () => {
    const date = new Date('2020-01-01T00:30:00');
    assert.equal(speechText('en', false, date), 'half past midnight');
  });

  it("should return 'quarter to 1' at 00:45", () => {
    const date = new Date('2020-01-01T00:45:00');
    assert.equal(speechText('en', false, date), 'quarter to 1');
  });

  it("should return '1 o'clock' at 01:00", () => {
    const date = new Date('2020-01-01T01:00:00');
    assert.equal(speechText('en', false, date), "1 o'clock");
  });

  it("should return 'quarter to noon' at 11:45", () => {
    const date = new Date('2020-01-01T11:45:00');
    assert.equal(speechText('en', false, date), 'quarter to noon');
  });

  it("should return 'noon' at 12:00", () => {
    const date = new Date('2020-01-01T12:00:00');
    assert.equal(speechText('en', false, date), 'noon');
  });

  it("should return 'midnight' at 00:00", () => {
    const date = new Date('2020-01-01T00:00:00');
    assert.equal(speechText('en', true, date), 'midnight');
  });

  it("should return '00:01 a.m.' at 00:01", () => {
    const date = new Date('2020-01-01T00:01:00');
    assert.equal(speechText('en', true, date), '00:01 a.m.');
  });

  it("should return 'quarter to 1 a.m.' at 00:45", () => {
    const date = new Date('2020-01-01T00:45:00');
    assert.equal(speechText('en', true, date), 'quarter to 1 a.m.');
  });

  it("should return '1 a.m.' at 01:00", () => {
    const date = new Date('2020-01-01T01:00:00');
    assert.equal(speechText('en', true, date), '1 a.m.');
  });

  it("should return 'quarter past 1 a.m.' at 01:15", () => {
    const date = new Date('2020-01-01T01:15:00');
    assert.equal(speechText('en', true, date), 'quarter past 1 a.m.');
  });

  it("should return '1 p.m.' at 13:00", () => {
    const date = new Date('2020-01-01T13:00:00');
    assert.equal(speechText('en', true, date), '1 p.m.');
  });

  it("should return '01:01 p.m.' at 13:01", () => {
    const date = new Date('2020-01-01T13:01:00');
    assert.equal(speechText('en', true, date), '01:01 p.m.');
  });

  it("should return '0時' at 00:00", () => {
    const date = new Date('2020-01-01T00:00:00');
    assert.equal(speechText('ja-JP', false, date), '0時');
  });

  it("should return '0時1分' at 00:01", () => {
    const date = new Date('2020-01-01T00:01:00');
    assert.equal(speechText('ja-JP', false, date), '0時1分');
  });

  it("should return '0時半' at 00:30", () => {
    const date = new Date('2020-01-01T00:30:00');
    assert.equal(speechText('ja-JP', false, date), '0時半');
  });

  it("should return '正午' at 12:00", () => {
    const date = new Date('2020-01-01T12:00:00');
    assert.equal(speechText('ja-JP', false, date), '正午');
  });

  it("should return '午前0時' at 00:00", () => {
    const date = new Date('2020-01-01T00:00:00');
    assert.equal(speechText('ja-JP', true, date), '午前0時');
  });

  it("should return '午前0時1分' at 00:01", () => {
    const date = new Date('2020-01-01T00:01:00');
    assert.equal(speechText('ja-JP', true, date), '午前0時1分');
  });

  it("should return '午前0時半' at 00:30", () => {
    const date = new Date('2020-01-01T00:30:00');
    assert.equal(speechText('ja-JP', true, date), '午前0時半');
  });

  it("should return '午前1時' at 01:00", () => {
    const date = new Date('2020-01-01T01:00:00');
    assert.equal(speechText('ja-JP', true, date), '午前1時');
  });

  it("should return '正午' at 12:00", () => {
    const date = new Date('2020-01-01T12:00:00');
    assert.equal(speechText('ja-JP', true, date), '正午');
  });

  it("should return '午後0時半' at 12:30", () => {
    const date = new Date('2020-01-01T12:30:00');
    assert.equal(speechText('ja-JP', true, date), '午後0時半');
  });

  it("should return '午後1時' at 13:00", () => {
    const date = new Date('2020-01-01T13:00:00');
    assert.equal(speechText('ja-JP', true, date), '午後1時');
  });

  it("should return '00:00' at 00:00", () => {
    const date = new Date('2020-01-01T00:00:00');
    assert.equal(speechText('zn-CH', false, date), '00:00');
  });

  it("should return '00:00' at 00:00", () => {
    const date = new Date('2020-01-01T00:00:00');
    assert.equal(speechText('zn-CH', true, date), '00:00');
  });
});
