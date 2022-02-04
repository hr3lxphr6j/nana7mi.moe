import {getCloudfrontUrl} from "../src/utils";

describe('handle', () => {
  beforeEach(() => {
    jest.resetModules()
  })
  test('handle GET', async () => {
    console.log(getCloudfrontUrl('808663844.cover.png', 'test'))
  })
})