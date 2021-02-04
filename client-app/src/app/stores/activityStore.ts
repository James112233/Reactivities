import { action, observable, computed, runInAction, makeObservable } from "mobx";
import { SyntheticEvent } from "react";
import { toast } from "react-toastify";
import { history } from "../..";
import agent from "../api/agent";
import { createAttendee, setActivityProps } from "../common/util/util";
import { IActivity } from "../models/activity";
import { RootStore } from "./rootStore";



export default class ActivityStore {
    rootStore: RootStore;

    @observable activityRegistry = new Map();
    @observable activities: IActivity[] = [];
    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';
    @observable loading = false;

    constructor(rootStore: RootStore) {
        makeObservable(this);
        this.rootStore = rootStore;
    }

    @computed get activitiesByDate() {
        // console.log('act: ', this.groupActivitiesByDate(Array.from(this.activityRegistry.values())));
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()))
        // return Array.from(this.activityRegistry.values()).sort((a, b) => Date.parse(a.date) - Date.parse(b.date))
    }

    groupActivitiesByDate(activities: IActivity[]) {
        const sortedActivities = activities.sort(
            (a, b) => a.date.getTime() - b.date.getTime()
        )
        return Object.entries(sortedActivities.reduce((activities, activity) => {
            const date = activity.date.toISOString().split('T')[0];
            activities[date] = activities[date] ? [...activities[date], activity] : [activity];
            // console.log("date: ", date);
            // console.log("activities[date]: ", activities[date]);
            return activities;
        }, {} as { [key: string]: IActivity[] }));
    }

    @action loadActivities = async () => {
        this.loadingInitial = true;
        try {
            const activities = await agent.Activities.list()
            runInAction(() => {
                activities.forEach((activity) => {
                    setActivityProps(activity, this.rootStore.userStore.user!)
                    this.activityRegistry.set(activity.id, activity);
                });
                this.loadingInitial = false;
            })
        } catch (error) {
            runInAction(() => {
                this.loadingInitial = false;
            })
            console.log(error);
        }
    }

    @action loadActivity = async (id: string) => {
        let activity = this.getActivity(id);
        if (activity) {
            this.activity = activity
            return activity
        } else {
            this.loadingInitial = true;
            try {
                activity = await agent.Activities.details(id);
                runInAction(() => {
                    setActivityProps(activity, this.rootStore.userStore.user!);
                    this.activity = activity;
                    this.activityRegistry.set(activity.id, activity);
                    this.loadingInitial = false;
                })
                return activity
            } catch (error) {
                runInAction(() => {
                    this.loadingInitial = false;
                })
                console.log(error);
            }
        }
    }

    @action clearActivity = () => {
        this.activity = null;
    }

    getActivity = (id: string) => {
        return this.activityRegistry.get(id);
    }

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.create(activity);
            const attendee = createAttendee(this.rootStore.userStore.user!);
            attendee.isHost = true;
            let attendees = [];
            attendees.push(attendee);
            activity.attendees = attendees;
            activity.isHost = true;
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
            });
            history.push(`/activities/${activity.id}`)

        } catch (error) {
            runInAction(() => {
                this.submitting = false;
            })
            toast.error("Problems when submitting data.")
            console.log(error.response);
        }
    }

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;
        try {
            await agent.Activities.update(activity);
            runInAction(() => {
                this.activityRegistry.set(activity.id, activity);
                this.activity = activity;
                this.submitting = false;
            });
            history.push(`/activities/${activity.id}`)
        } catch (error) {
            runInAction(() => {
                this.submitting = false;
            })
            toast.error("Problems when submitting data.")
            console.log(error.response);
        }
    }

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;
        try {
            await agent.Activities.delete(id);
            runInAction(() => {
                this.activityRegistry.delete(id);
                this.submitting = false;
                this.target = '';
            })

        } catch (error) {
            runInAction(() => {
                this.submitting = false;
                this.target = '';
            })
            console.log(error);
        }
    }

    @action selectActivity = (id: string) => {
        console.log('select activity');
        this.activity = this.activityRegistry.get(id);
    };

    @action attendActivity = async () => {
        const attendee = createAttendee(this.rootStore.userStore.user!);
        this.loading = true;
        try {
            await agent.Activities.attend(this.activity!.id);
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees.push(attendee);
                    this.activity.isGoing = true;
                    this.activityRegistry.set(this.activity.id, this.activity);
                    this.loading = false;
                }
            })
        } catch (error) {
            runInAction(() => {
                this.loading = false;
            })

            toast.error('Problem signing up to activity.')
        }

    }

    @action cancelAttendance = async () => {
        this.loading = true;
        try {
            await agent.Activities.unattend(this.activity!.id);
            runInAction(() => {
                if (this.activity) {
                    this.activity.attendees = this.activity.attendees.filter(
                        a => a.username !== this.rootStore.userStore.user!.userName);
                    this.activity.isGoing = false;
                    this.activityRegistry.set(this.activity.id, this.activity);
                    this.loading = false;
                }
            })
        } catch (error) {
            runInAction(() => {
                this.loading = false;
            })
            toast.error('Problem cancelling attendance.')
        }

    }
}

