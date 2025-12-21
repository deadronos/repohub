from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to home...")
        try:
            page.goto("http://localhost:3000", timeout=30000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        print("Waiting for project card...")
        try:
            expect(page.get_by_text("Mock Project")).to_be_visible(timeout=10000)
        except Exception:
            print("Project card not found. Dumping page content...")
            print(page.content())
            page.screenshot(path="/home/jules/verification/failed_home.png")
            return

        print("Waiting for stats...")
        # Give some time for the server action to return
        time.sleep(3)

        # Verify stats are present (Next.js has lots of stars, so checking for digits)
        # We can check for the test-id
        stats = page.locator('[data-testid="github-stats"]')
        if stats.count() > 0:
            print("Stats component found.")
        else:
            print("Stats component NOT found.")

        page.screenshot(path="/home/jules/verification/home_stats.png")
        print("Home screenshot taken.")

        print("Clicking card...")
        page.get_by_text("Mock Project").click()

        print("Waiting for modal...")
        expect(page.get_by_text("Long description.")).to_be_visible()
        time.sleep(1)

        page.screenshot(path="/home/jules/verification/modal_stats.png")
        print("Modal screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
