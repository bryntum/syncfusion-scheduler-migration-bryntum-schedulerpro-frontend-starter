import { dropdowns } from "@syncfusion/ej2";
import { createElement } from "@syncfusion/ej2-base";
import {
  DragAndDrop,
  EventRenderedArgs,
  RenderCellEventArgs,
  Resize,
  Schedule,
  SortComparerFunction,
  TimelineViews,
} from "@syncfusion/ej2-schedule";

const comparerFun: SortComparerFunction = (args: Record<string, any>) =>
  args.sort((event1: Record<string, any>, event2: Record<string, any>) => {
    const priority1 = event1.Priority === "high" ? 1 : 0;
    const priority2 = event2.Priority === "high" ? 1 : 0;
    return priority2 - priority1;
    }
  );
  
import { Toolbar } from "@syncfusion/ej2-navigations";
import { DataManager, UrlAdaptor } from "@syncfusion/ej2/data";

// Initialize the toolbar
const toolbarObj: Toolbar = new Toolbar({
  items: [
    { text: "No sorting", id: "none" },
    { text: "Sort by priority", id: "priority" },
  ],
  clicked: (args) => {
    if (args.item.id === "priority") {
      // Set the sortComparer when "Priority" is selected
      scheduleObj.eventSettings.sortComparer = comparerFun;
      // Refresh the scheduler to reflect the changes
      scheduleObj.refresh();
    }
    if (args.item.id === "none") {
      scheduleObj.eventSettings.sortComparer = undefined;
      scheduleObj.refresh();
    }
  },
});

// Render the toolbar
toolbarObj.appendTo("#Toolbar");

Schedule.Inject(TimelineViews, Resize, DragAndDrop);

const dataManagerEvents: DataManager = new DataManager({
  url: "http://localhost:1338/api/getEventsData",
  adaptor: new UrlAdaptor(),
  batchUrl: "http://localhost:1338/api/batchEventsData",
});

const dataManagerResources: DataManager = new DataManager({
  url: "http://localhost:1338/api/getResourcesData",
  adaptor: new UrlAdaptor(),
});

const scheduleObj: Schedule = new Schedule({
  width: "100%",
  height: "100vh",
  selectedDate: new Date(2024, 3, 15),
  currentView: "TimelineWeek",
  views: ["TimelineWeek"],
  group: {
    allowGroupEdit: true,
    resources: ["Resource"],
  },
  resources: [
    {
      field: "ResourceId",
      title: "Resources",
      name: "Resource",
      allowMultiple: true,
      dataSource: dataManagerResources,
    },
  ],
  popupOpen: function (args) {
    if (args.type === "Editor") {
      if (!args.element.querySelector(".custom-field-row")) {
        var row = createElement("div", {
          className: "custom-field-row",
        });
        console.log({ args }, args?.data.Priority);
        var formElement = args.element.querySelector(".e-schedule-form");
        formElement.firstChild.insertBefore(
          row,
          args.element.querySelector(".e-title-location-row")
        );
        var container = createElement("div", {
          className: "custom-field-container",
        });
        var inputEle = createElement("input", {
          className: "e-field",
          attrs: { name: "Priority" },
        });
        container.appendChild(inputEle);
        row.appendChild(container);
        var drowDownList = new dropdowns.DropDownList({
          dataSource: [
            { text: "High", value: "high" },
            { text: "Low", value: "low" },
          ],
          fields: { text: "text", value: "value" },
          value: args.data.Priority,
          floatLabelType: "Always",
          placeholder: "Priority",
        });
        drowDownList.appendTo(inputEle);
        inputEle.setAttribute("name", "Priority");
      }
    }
  },
  eventSettings: {
    dataSource: dataManagerEvents,
    sortComparer: undefined,
  },
  eventRendered: (args: EventRenderedArgs) => {
    const Priority = args.data.Priority as string;
    if (Priority === "high") {
      args.element.style.backgroundColor = "red";
    }
  },
  renderCell: (args: RenderCellEventArgs) => {
    if (
      args.elementType === "emptyCells" &&
      args.element.classList.contains("e-resource-left-td")
    ) {
      let target: HTMLElement = args.element.querySelector(
        ".e-resource-text"
      ) as HTMLElement;
      target.innerHTML = '<div class="name">Name</div>';
    }
  },
});

scheduleObj.appendTo("#Scheduler");