import React, { useEffect, useState } from "react";

import Logger from "js-logger";
import { GoogleCalendarIcon, IntegrateIcon } from "miruIcons";
import { Button, Switch } from "StyledComponents";

import companiesApi from "apis/companies";
import googleCalendarApi from "apis/googleCalendar";
import teamApi from "apis/team";
import Loader from "common/Loader/index";

import Header from "./Header";

const GoogleCalendar = ({ isAdmin, calendarEnabled, calendarConnected }) => {
  const [connectGoogleCalendar, setConnectGoogleCalendar] =
    useState<boolean>(calendarConnected);
  const [enabled, setEnabled] = useState<boolean>(calendarEnabled);
  const [apiCallNeeded, setApiCallNeeded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isAdmin) {
      const companiesData = async () => {
        setLoading(true);
        try {
          const {
            data: { company_details },
          } = await companiesApi.index();
          setEnabled(company_details.calendar_enabled);
        } catch (error) {
          Logger.log(error);
        } finally {
          setLoading(false);
        }
      };
      companiesData();
    }
  }, []);

  useEffect(() => {
    if (apiCallNeeded) {
      enableCalendar();
      setApiCallNeeded(false);
    }
  }, [apiCallNeeded]);

  if (loading) {
    return <Loader className="min-h-70v" />;
  }

  const enableCalendar = async () => {
    try {
      const payload = { team: { calendar_enabled: enabled } };
      await teamApi.updateTeamMembers(payload);
    } catch (error) {
      Logger.log(error);
    }
  };

  const toggleEnabled = () => {
    setEnabled(prevEnabled => !prevEnabled);
    setApiCallNeeded(true);
  };

  const handleConnectCalendar = async () => {
    setConnectGoogleCalendar(true);
    const { data } = await googleCalendarApi.redirect();
    window.location.replace(data.url);
  };

  const handleDisconnectCalendar = async () => {
    setConnectGoogleCalendar(false);
    await googleCalendarApi.callback();
    window.location.replace("/profile/edit/integrations");
  };

  const showConnectDisconnectBtn = () => {
    if (enabled) {
      return connectGoogleCalendar ? (
        <div className="mt-5 flex flex-row items-center text-miru-red-400">
          <IntegrateIcon size={12} />
          <Button
            className="ml-1 text-sm font-bold"
            onClick={handleDisconnectCalendar}
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <Button
          className="mt-5 px-3 py-1 text-xs"
          style="primary"
          onClick={handleConnectCalendar}
        >
          Connect
        </Button>
      );
    }
  };

  return (
    <div className="flex w-full flex-col">
      <Header title="Integrations" />
      <div className="mt-4 h-full min-h-50v bg-miru-gray-100 py-10 px-10">
        <div className="grid-gap-4 grid grid-cols-2">
          <div className=" w-4/5 bg-white p-5">
            <div className="flex w-fit items-center pr-12">
              <div>
                <img className="w-1/5 py-5" src={GoogleCalendarIcon} />
              </div>
              {isAdmin && <Switch enabled={enabled} onChange={toggleEnabled} />}
            </div>
            <span className="text-base font-bold leading-5 text-miru-dark-purple-1000">
              Google Calendar
            </span>
            <p className="mt-4">
              Connect your google calendar to automatically sync your meetings
              with Miru
            </p>
            {showConnectDisconnectBtn()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendar;