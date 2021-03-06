import React from 'react';
import configureStore from 'redux-mock-store';
import Immutable, { Map } from 'immutable';
import moment from 'moment';
import { createMemoryHistory } from 'history';
import { MemoryRouter, Router, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import AppConstants from '../../../common/AppConstants';
import { YourGroupTasksContainer } from './YourGroupTasksContainer';
import { RouteWithTitle } from '../../../core/Main';

jest.useFakeTimers();

describe('YourGroupTasksContainer Page', () => {
  const mockStore = configureStore();
  let store;
  const date = moment();
  const history = createMemoryHistory('/your-tasks');
  const yourGroupTasks = {
    history,
    isFetchingTasks: false,
    sortValue: 'sort=due,asc',
    total: 1,
    tasks: Immutable.fromJS([
      {
        task: {
          id: 'id',
          name: 'test',
          priority: 1000,
          due: date,
          created: date,
          assignee: 'test@test.com',
        },
      },
    ]),
  };
  beforeEach(() => {
    store = mockStore({
      'tasks-page': new Map({}),
      'task-page': new Map({}),
      keycloak: {
        tokenParsed: {
          email: 'test@test.com',
        },
      },
    });
    window.matchMedia =
      window.matchMedia ||
      function matchMedia() {
        return {
          matches: true,
          addListener() {},
          removeListener() {},
        };
      };
  });
  afterEach(() => {
    window.matchMedia = null;
  });
  const fetchYourGroupTasks = jest.fn();

  it('sets document title as expected', done => {
    const history = createMemoryHistory('/your-tasks');
    const props = {
      isFetchingTasks: true,
      groupYourTeamTasks: jest.fn(),
      history,
      kc: {
        tokenParsed: {
          email: 'email',
        },
      },
    };

    mount(
      <MemoryRouter initialEntries={['/your-group-tasks']}>
        <Switch>
          <RouteWithTitle
            name="Your group tasks"
            title={`Your team’s tasks | ${AppConstants.APP_NAME}`}
            exact
            path={AppConstants.YOUR_GROUP_TASKS_PATH}
            component={() => (
              <YourGroupTasksContainer
                store={store}
                {...props}
                fetchYourGroupTasks={fetchYourGroupTasks}
              />
            )}
          />
        </Switch>
      </MemoryRouter>,
    );
    requestAnimationFrame(() => {
      expect(document.title).toBe(
        `Your team’s tasks | ${AppConstants.APP_NAME}`,
      );
      done();
    });
  });

  it('renders data spinner while loading tasks', async () => {
    const history = createMemoryHistory('/your-tasks');
    const props = {
      isFetchingTasks: true,
      history,
      kc: {
        tokenParsed: {
          email: 'email',
        },
      },
    };
    const wrapper = await mount(
      <YourGroupTasksContainer
        {...props}
        {...{ store, fetchYourGroupTasks }}
      />,
    );
    expect(fetchYourGroupTasks).toBeCalled();
    expect(wrapper.find('.loader-content').exists()).toEqual(true);
    expect(wrapper.find('.loader-message').text()).toEqual(
      'Fetching your group tasks',
    );
  });

  it('renders your group tasks', async () => {
    const history = createMemoryHistory('/your-tasks');

    const props = {
      history,
      ...yourGroupTasks,
      kc: {
        tokenParsed: {
          email: 'test@test.com',
        },
      },
    };
    const wrapper = await mount(
      <Provider store={store}>
        <Router history={history}>
          <YourGroupTasksContainer
            {...props}
            {...{ store, fetchYourGroupTasks }}
          />
        </Router>
      </Provider>,
    );

    expect(fetchYourGroupTasks).toBeCalled();
    expect(wrapper.find('.loader-content').exists()).toEqual(false);
    expect(wrapper.find('#yourGroupTasksTotalCount').text()).toEqual(
      'Your team’s tasks1 task assigned to your teamThis page auto refreshes every 5 minutes',
    );
    const rows = wrapper.find('#taskGroups');
    expect(rows.length).toEqual(1);
  });

  it('renders your group tasks on filter value', async () => {
    const history = createMemoryHistory('/your-tasks');

    const props = {
      history,
      ...yourGroupTasks,
      kc: {
        tokenParsed: {
          email: 'test@test.com',
        },
      },
    };
    const wrapper = await mount(
      <Provider store={store}>
        <Router history={history}>
          <YourGroupTasksContainer
            {...props}
            {...{ store, fetchYourGroupTasks }}
          />
        </Router>
      </Provider>,
    );

    expect(fetchYourGroupTasks).toBeCalled();
    const filterInput = wrapper.find('#filterTaskName');

    filterInput.simulate('change', { target: { value: 'ABC' } });
    jest.advanceTimersByTime(600);
    expect(fetchYourGroupTasks).toBeCalledWith('sort=due,asc', 'ABC', true);

    filterInput.simulate('change', { target: { value: 'APPLES' } });
    jest.advanceTimersByTime(600);
    expect(fetchYourGroupTasks).toBeCalledWith('sort=due,asc', 'APPLES', true);
  });

  it('executes timer', async () => {
    const history = createMemoryHistory('/your-tasks');

    const props = {
      history,
      kc: {
        tokenParsed: {
          email: 'email',
        },
      },
      isFetchingTasks: false,
      sortValue: 'sort=due,asc',
      filterValue: 'TEST',
      total: 1,
      tasks: Immutable.fromJS([
        {
          task: {
            id: 'id',
            name: 'test',
            priority: 1000,
            due: date,
            created: date,
          },
        },
      ]),
    };

    const wrapper = await mount(
      <Provider store={store}>
        <Router history={history}>
          <YourGroupTasksContainer
            {...props}
            {...{ store, fetchYourGroupTasks }}
          />
        </Router>
      </Provider>,
    );

    expect(fetchYourGroupTasks).toBeCalledWith('sort=due,asc', null, false);

    // kick off timer
    jest.advanceTimersByTime(AppConstants.REFRESH_TIMEOUT);
    expect(fetchYourGroupTasks).toBeCalledWith('sort=due,asc', 'TEST', true);

    //
    wrapper.unmount();
    expect(clearTimeout).toBeCalled();
  });

  it('displays claim button if assignee not user', async () => {
    const history = createMemoryHistory('/your-tasks');

    const props = {
      kc: {
        tokenParsed: {
          email: 'email',
        },
      },
      history,
      claimSuccessful: true,
      isFetchingTasks: false,
      sortValue: 'sort=due,asc',
      filterValue: 'TEST',
      total: 1,
      tasks: Immutable.fromJS([
        {
          task: {
            id: 'id',
            name: 'test',
            priority: 1000,
            due: date,
            created: date,
          },
        },
      ]),
    };

    const wrapper = await mount(
      <Provider store={store}>
        <Router history={history}>
          <YourGroupTasksContainer
            {...props}
            {...{ store, fetchYourGroupTasks }}
          />
        </Router>
      </Provider>,
    );

    const unclaimButton = wrapper.find('input').first();
    expect(unclaimButton.exists()).toEqual(true);
  });
});
