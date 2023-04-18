import { Widget } from "./widget";

export class WidgetCollector {
    private static collection: { [name: string]: Widget };
    private static sortedCollection: Widget[];
    private static widgetFocused: boolean | Widget = false;
    private static lastWidgetFocused: Widget | undefined;

    static setInstance() {
        WidgetCollector.clearAllInstances();
    }

    static getAllInstances() {
        return this.sortedCollection;
    }

    static addInstance(name: string, widget: Widget) {
        if (name in widget) return widget;
        WidgetCollector.collection[name] = widget;
        WidgetCollector.updateRenderPriority();
        return widget;
    }

    static clearAllInstances() {
        WidgetCollector.collection = {};
    }

    static updateRenderPriority() {
        const widgets = Object.values(WidgetCollector.collection).flat();
        WidgetCollector.sortedCollection = widgets.sort(
            (a, b) => a.renderPriority - b.renderPriority
        );
    }

    static draw() {
        // update widgets
        for (const widget of WidgetCollector.sortedCollection.reverse())
            widget.update(); // render priority is opposite of update priority.

        // default to last selected if focus cannot be resolved this frame
        if (
            !WidgetCollector.isWidgetFocused() &&
            WidgetCollector.lastWidgetFocused !== undefined &&
            WidgetCollector.lastWidgetFocused.active
        ) {
            WidgetCollector.lastWidgetFocused.renderPriority = 2;
            WidgetCollector.updateRenderPriority();
        }

        // draw widgets
        for (const widget of WidgetCollector) widget.draw();
        this.widgetFocused = false;
    }

    static [Symbol.iterator]() {
        const collectionValues = Object.values(
            WidgetCollector.sortedCollection
        );
        let index = 0;

        return {
            next(): IteratorResult<Widget> {
                if (index < collectionValues.length) {
                    return {
                        value: collectionValues[index++],
                        done: false,
                    };
                } else {
                    return {
                        value: undefined,
                        done: true,
                    };
                }
            },
        };
    }

    static *filter<T extends Widget>(
        widgetType: new (...args: any) => T
    ): IterableIterator<T> {
        for (const widget of WidgetCollector) {
            if (widget instanceof widgetType) yield widget;
        }
    }

    static windowResized() {
        for (const widget of WidgetCollector) widget.buffer();
    }

    static keyPressed() {
        for (const widget of WidgetCollector) widget.keyPressed();
    }

    static isWidgetFocused() {
        return WidgetCollector.widgetFocused !== false;
    }

    static getLastFocusedWidget() {
        return WidgetCollector.lastWidgetFocused;
    }

    static focusWidget(widget: Widget) {
        WidgetCollector.widgetFocused = widget;
        WidgetCollector.lastWidgetFocused = widget;
    }
}
