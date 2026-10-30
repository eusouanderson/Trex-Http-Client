import { test as baseTest, expect } from '@playwright/test';
import {
  AppPage,
  CollectionRunnerPage,
  CollectionsPage,
  CommandPalettePage,
  EnvironmentsPage,
  RequestBuilderPage,
  ResponseDiffPage,
  ResponseViewerPage,
  SettingsPage,
} from '../pages';

interface TestFixtures {
  appPage: AppPage;
  requestBuilderPage: RequestBuilderPage;
  responseViewerPage: ResponseViewerPage;
  collectionsPage: CollectionsPage;
  environmentsPage: EnvironmentsPage;
  settingsPage: SettingsPage;
  commandPalettePage: CommandPalettePage;
  responseDiffPage: ResponseDiffPage;
  collectionRunnerPage: CollectionRunnerPage;
}

const test = baseTest.extend<TestFixtures>({
  appPage: async ({ page }, use) => {
    const app = new AppPage(page);
    await use(app);
  },
  requestBuilderPage: async ({ page }, use) => {
    const requestBuilder = new RequestBuilderPage(page);
    await use(requestBuilder);
  },
  responseViewerPage: async ({ page }, use) => {
    const responseViewer = new ResponseViewerPage(page);
    await use(responseViewer);
  },
  collectionsPage: async ({ page }, use) => {
    const collections = new CollectionsPage(page);
    await use(collections);
  },
  environmentsPage: async ({ page }, use) => {
    const environments = new EnvironmentsPage(page);
    await use(environments);
  },
  settingsPage: async ({ page }, use) => {
    const settings = new SettingsPage(page);
    await use(settings);
  },
  commandPalettePage: async ({ page }, use) => {
    const commandPalette = new CommandPalettePage(page);
    await use(commandPalette);
  },
  responseDiffPage: async ({ page }, use) => {
    const responseDiff = new ResponseDiffPage(page);
    await use(responseDiff);
  },
  collectionRunnerPage: async ({ page }, use) => {
    const collectionRunner = new CollectionRunnerPage(page);
    await use(collectionRunner);
  },
});

export { test, expect };
