import React from 'react';
import Immutable, { Map, List } from 'immutable';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { ProcessStartPage } from './FormsStartPage';
import secureLocalStorage from '../../../../common/security/SecureLocalStorage';
import AppConstants from '../../../../common/AppConstants';

jest.mock('../../../../common/security/SecureLocalStorage', () => ({
  get: jest.fn(),
  set: jest.fn(),
  removeAll: jest.fn(),
  remove: jest.fn(),
}));

const form = {
  display: 'form',
  components: [
    {
      id: 'firstNameId',
      label: 'First name',
      allowMultipleMasks: false,
      showWordCount: false,
      showCharCount: false,
      tableView: true,
      alwaysEnabled: false,
      type: 'textfield',
      input: true,
      key: 'firstName',
      widget: {
        type: '',
      },
    },
    {
      id: 'surnameId',
      label: 'Surname',
      allowMultipleMasks: false,
      showWordCount: false,
      showCharCount: false,
      tableView: true,
      alwaysEnabled: false,
      type: 'textfield',
      input: true,
      key: 'surname',
      widget: {
        type: '',
      },
    },
    {
      id: 'submitId',
      type: 'button',
      label: 'Submit',
      key: 'submit',
      disableOnInvalid: true,
      theme: 'primary',
      input: true,
      tableView: true,
    },
  ],
};

describe('Submit a form page', () => {
  it('sets document title as expected while processDefinition loading', () => {
    const props = {
      loadingForm: true,
      submissionStatus: null,
      match: {
        params: {
          processKey: 'processKey',
        },
      },
      clearProcessDefinition: jest.fn(),
      fetchProcessDefinition: jest.fn(),
    };

    shallow(<ProcessStartPage {...props} />);
    expect(global.window.document.title).toBe(AppConstants.APP_NAME);
  });

  it('renders loading bar if form is loading', async () => {
    const props = {
      loadingForm: true,
      submissionStatus: null,
      match: {
        params: {
          processKey: 'processKey',
        },
      },
    };
    const fetchProcessDefinition = jest.fn();
    const clearProcessDefinition = jest.fn();

    const wrapper = await mount(
      <ProcessStartPage
        {...props}
        clearProcessDefinition={clearProcessDefinition}
        fetchProcessDefinition={fetchProcessDefinition}
      />,
    );

    expect(fetchProcessDefinition).toHaveBeenCalled();
    expect(wrapper.find('#dataSpinner').exists()).toEqual(true);
    expect(wrapper.find('.loader-message').text()).toEqual('Loading form...');
  });

  it('displays Not Found component if form is missing', async () => {
    const props = {
      loadingForm: false,
      submissionStatus: null,
      form: null,
      processDefinition: Immutable.fromJS({
        formKey: 'formKey',
      }),
      appConfig: {
        apiRefUrl: 'apiRefUrl',
        workflowUrl: 'workflow',
        operationalDataUrl: 'operational',
      },
      kc: {
        token: 'token',
        refreshToken: 'refreshToken',
        tokenParsed: {
          session_state: 'sessionState',
          email: 'email',
          given_name: 'given_name',
          family_name: 'familyName',
          realm_access: { roles: ['role'] },
        },
      },
      match: {
        params: {
          processKey: 'processKey',
        },
      },
    };
    const fetchProcessDefinition = jest.fn();
    const clearProcessDefinition = jest.fn();
    const store = configureStore()({
      'error-page': Map({
        errors: List([
          Map({
            status: 404,
            message: 'test',
          }),
        ]),
      }),
    });
    const wrapper = await mount(
      <Provider store={store}>
        <ProcessStartPage
          {...props}
          clearProcessDefinition={clearProcessDefinition}
          fetchProcessDefinition={fetchProcessDefinition}
        />
      </Provider>,
    );
    expect(fetchProcessDefinition).toHaveBeenCalled();
    expect(wrapper.find('NotFoundPage')).toHaveLength(1);
  });

  it('sets document title as expected when processDefinition loaded', () => {
    const props = {
      loadingForm: true,
      submissionStatus: null,
      isFetchingProcessDefinition: false,
      appConfig: {
        apiRefUrl: 'apiRefUrl',
        workflowUrl: 'workflow',
        operationalDataUrl: 'operational',
      },
      history: {
        location: {
          pathname: '/path',
        },
      },
      kc: {
        tokenParsed: {
          email: 'email',
          realm_access: { roles: ['role'] },
        },
      },
      form: null,
      processDefinition: Immutable.fromJS({
        formKey: 'formKey',
        'process-definition': {
          name: 'procedure',
        },
      }),
      match: {
        params: {
          processKey: 'processKey',
        },
      },
      fetchProcessDefinition: jest.fn(),
      clearProcessDefinition: jest.fn(),
      fetchForm: jest.fn(),
    };

    const wrapper = shallow(<ProcessStartPage {...props} />);
    wrapper.setProps({
      isFetchingProcessDefinition: false,
    });
    expect(global.window.document.title).toBe(
      `procedure | ${AppConstants.APP_NAME}`,
    );
  });

  it('fetches form after loading process definition', async () => {
    const props = {
      loadingForm: true,
      submissionStatus: null,
      isFetchingProcessDefinition: true,
      appConfig: {
        apiRefUrl: 'apiRefUrl',
        workflowUrl: 'workflow',
        operationalDataUrl: 'operational',
      },
      history: {
        location: {
          pathname: '/path',
        },
      },
      kc: {
        tokenParsed: {
          email: 'email',
          realm_access: { roles: ['role'] },
        },
      },
      form: null,
      processDefinition: Immutable.fromJS({
        formKey: 'formKey',
      }),
      match: {
        params: {
          processKey: 'processKey',
        },
      },
    };
    const fetchProcessDefinition = jest.fn();
    const clearProcessDefinition = jest.fn();
    const fetchForm = jest.fn();

    const wrapper = await mount(
      <ProcessStartPage
        {...props}
        clearProcessDefinition={clearProcessDefinition}
        fetchProcessDefinition={fetchProcessDefinition}
        fetchForm={fetchForm}
      />,
    );
    expect(fetchProcessDefinition).toHaveBeenCalled();
    wrapper.setProps({
      isFetchingProcessDefinition: false,
    });
    expect(fetchForm).toHaveBeenCalled();
  });

  it('renders the form and process definition', async () => {
    const props = {
      history: {
        location: {
          pathname: '/path',
        },
      },
      kc: {
        tokenParsed: {
          email: 'email',
          realm_access: { roles: ['role'] },
        },
      },
      loadingForm: false,
      submissionStatus: null,
      form,
      processDefinition: Immutable.fromJS({
        formKey: 'formKey',
        'process-definition': {
          name: 'procedure',
        },
      }),
      appConfig: {
        apiRefUrl: 'apiRefUrl',
        workflowUrl: 'workflow',
        operationalDataUrl: 'operational',
      },
      match: {
        params: {
          processKey: 'processKey',
        },
      },
    };
    const fetchProcessDefinition = jest.fn();
    const clearProcessDefinition = jest.fn();

    const wrapper = await shallow(
      <ProcessStartPage
        {...props}
        clearProcessDefinition={clearProcessDefinition}
        fetchProcessDefinition={fetchProcessDefinition}
      />,
    );
    expect(fetchProcessDefinition).toHaveBeenCalled();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders Loader if submitted form', async () => {
    const props = {
      history: {
        location: {
          pathname: '/path',
        },
      },
      kc: {
        tokenParsed: {
          email: 'email',
          realm_access: { roles: ['role'] },
        },
      },
      appConfig: {
        apiRefUrl: 'apiRefUrl',
        workflowUrl: 'workflow',
        operationalDataUrl: 'operational',
      },
      loadingForm: false,
      submissionStatus: 'SUBMITTING',
      form,
      processDefinition: Immutable.fromJS({
        'process-definition': {
          formKey: 'formKey',
          id: 'id',
        },
      }),
      match: {
        params: {
          processKey: 'processKey',
        },
      },
    };
    const fetchProcessDefinition = jest.fn();
    const clearProcessDefinition = jest.fn();

    const wrapper = await mount(
      <ProcessStartPage
        {...props}
        clearProcessDefinition={clearProcessDefinition}
        fetchProcessDefinition={fetchProcessDefinition}
      />,
    );
    wrapper.setProps({ submittingToWorkflow: true });

    const loaderContent = wrapper.find('.Loader__content');

    expect(secureLocalStorage.get).toHaveBeenCalled();

    expect(loaderContent.exists()).toEqual(true);
    expect(loaderContent.prop('style')).toEqual({ opacity: 0 });
  });

  it('redirects to tasks after submission', async () => {
    const props = {
      history: {
        replace: jest.fn(),
        location: {
          pathname: '/path',
        },
      },
      submissionResponse: {},
      kc: {
        tokenParsed: {
          email: 'email',
          realm_access: { roles: ['role'] },
        },
      },
      loadingForm: false,
      submissionStatus: 'SUBMITTING',
      form,
      log: jest.fn(),
      processDefinition: Immutable.fromJS({
        'process-definition': {
          formKey: 'formKey',
          id: 'id',
        },
      }),
      appConfig: {
        apiRefUrl: 'apiRefUrl',
        workflowUrl: 'workflow',
        operationalDataUrl: 'operational',
      },
      match: {
        params: {
          processKey: 'processKey',
        },
      },
    };
    const fetchProcessDefinition = jest.fn();
    const clearProcessDefinition = jest.fn();

    const wrapper = await mount(
      <ProcessStartPage
        {...props}
        clearProcessDefinition={clearProcessDefinition}
        fetchProcessDefinition={fetchProcessDefinition}
      />,
    );

    const emit = jest.fn(args => console.log(`Event ${args}`));
    wrapper.instance().form.formio = {
      emit,
    };
    wrapper.setProps({ submissionStatus: 'SUBMISSION_SUCCESSFUL' });

    expect(emit).toHaveBeenCalled();
    expect(secureLocalStorage.remove).toHaveBeenCalled();
    expect(props.history.replace).toHaveBeenCalled();
  });

  it('does not redirect if there was an error', async () => {
    const props = {
      loadingForm: false,
      submissionStatus: 'SUBMITTING',
      submissionResponse: {},
      form,
      log: jest.fn(),
      processDefinition: Immutable.fromJS({
        'process-definition': {
          formKey: 'formKey',
          id: 'id',
        },
      }),
      appConfig: {
        apiRefUrl: 'apiRefUrl',
        workflowUrl: 'workflow',
        operationalDataUrl: 'operational',
      },
      match: {
        params: {
          processKey: 'processKey',
        },
      },
      history: {
        replace: jest.fn(),
        location: {
          pathname: '/path',
        },
      },
      kc: {
        tokenParsed: {
          email: 'email',
          realm_access: { roles: ['role'] },
        },
      },
    };
    const fetchProcessDefinition = jest.fn();
    const clearProcessDefinition = jest.fn();

    const wrapper = await mount(
      <ProcessStartPage
        {...props}
        clearProcessDefinition={clearProcessDefinition}
        fetchProcessDefinition={fetchProcessDefinition}
      />,
    );

    const emit = jest.fn(args => console.log(`Event ${args}`));
    const submission = {
      data: {
        firstNameId: 'firstname',
        surnameId: 'surname',
      },
    };
    wrapper.instance().form.formio = {
      emit,
      submission,
    };
    wrapper.setProps({ submissionStatus: 'FAILED' });

    expect(emit).toBeCalledWith('error');
    expect(emit).toBeCalledWith('change', submission);
    expect(props.log).toHaveBeenCalled();
    expect(props.history.replace).not.toHaveBeenCalled();
  });
});
