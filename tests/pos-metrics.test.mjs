import test from "node:test";
import assert from "node:assert/strict";
import {jaccard, worldDistance, diagnosticChange, persistence, health, recurrence, measure, exampleFrames} from "../assets/js/src/pos-metrics.js";

test("aligned world distance averages Entity, State, and Relation Jaccard distances", () => {
  assert.equal(jaccard([], []), 0);
  assert.equal(jaccard(["a","b"], ["b","a"]), 0);
  assert.equal(jaccard(["a"], ["b"]), 1);
  assert.equal(worldDistance({entities:["a"],states:["s"],relations:["r"]}, {entities:["a"],states:["s2"],relations:["r2"]}), 2/3);
});
test("confidence changes include increases, decreases, and removed independent records", () => {
  assert.equal(diagnosticChange({a:.8,b:.1}, {a:.4,b:.5}), .4);
  assert.equal(diagnosticChange({a:.8}, {b:.8}), .8);
  assert.equal(diagnosticChange({a:.9,b:.9}, {a:.1,b:.1}), .8);
});
test("persistence excludes gaps that disappear and later return", () => {
  assert.equal(persistence([[],["a"]]), 0);
  assert.equal(persistence([["a","b"],["a"],["a","b"]]), .5);
  assert.equal(persistence([["a"],[],["a"]]), 0);
});
test("health distinguishes unfinished progress from stagnation or recurrence", () => {
  assert.equal(health(1,1,0), 0);
  assert.equal(health(1,0,1), 0);
  assert.equal(health(1,0,0), 1);
  assert.equal(health(0,1,1), 1);
  assert.equal(health(.5, .75, .25), .625);
});
test("all presets are recomputable in execution and diagnosis", () => {
  for (const mode of ["execution","diagnosis"]) {
    const advancing = measure(exampleFrames("advancing", mode),8,mode);
    assert.deepEqual([advancing.p,advancing.s,advancing.r,advancing.h],[1,0,0,1]);
    const stagnant = measure(exampleFrames("stagnant",mode),8,mode);
    assert.deepEqual([stagnant.p,stagnant.s,stagnant.r,stagnant.h],[1,1,0,0]);
    const cycle = measure(exampleFrames("cycle",mode),8,mode);
    assert.deepEqual([cycle.s,cycle.r,cycle.recurrence.lag,cycle.h],[0,1,2,0]);
    const drift = measure(exampleFrames("drift",mode),8,mode);
    assert.deepEqual([drift.s,drift.r,drift.h],[1,1,0]);
  }
});
test("the warmup window never marks health ready before eight validated transitions", () => {
  const frames=exampleFrames("cycle","diagnosis");
  for(let i=0;i<8;i++) assert.equal(measure(frames,i,"diagnosis").ready,false);
  assert.equal(measure(frames,0,"diagnosis").h,null);
  assert.equal(measure(frames,8,"diagnosis").ready,true);
  frames[1].confidence={};
  frames[0].confidence={a:.6};
  assert.equal(measure(frames,1,"diagnosis").transitions[0].progress,0);
});
test("recurrence exposes all tested pairs and chooses lag two for alternating states", () => {
  const worlds=exampleFrames("cycle","execution").slice(1).map(x=>x.projection);
  const r=recurrence(worlds);
  assert.equal(r.comparisons.length,4);
  assert.equal(r.comparisons[1].pairs.length,6);
  assert.equal(r.comparisons[1].pairs.every(x=>x.repeated),true);
  assert.equal(r.comparisons[0].pairs.every(x=>!x.repeated),true);
  assert.equal(r.lag,2);
});
