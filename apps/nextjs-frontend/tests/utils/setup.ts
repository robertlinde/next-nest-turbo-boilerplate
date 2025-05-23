import {test as base} from '@playwright/test';

const test = base;

test.beforeEach(async () => {
  await fetch('http://localhost:1080/email/all', {
    method: 'DELETE',
  });
});

export {test};
